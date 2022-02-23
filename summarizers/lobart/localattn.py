import math
import torch
import torch.nn as nn
import torch.nn.functional as F

from transformers.modeling_bart import BartForConditionalGeneration, BartConfig, LearnedPositionalEmbedding
from transformers import LongformerConfig

class LocalSelfAttention(nn.Module):
    """
    copied from hugging face v2.11
    => from adapted from HuggingFace's Longformer atttention
    => currently global attention is removed
    """
    def __init__(self, config, layer_id):
        super().__init__()
        if config.hidden_size % config.num_attention_heads != 0:
            raise ValueError(
                "The hidden size (%d) is not a multiple of the number of attention "
                "heads (%d)" % (config.hidden_size, config.num_attention_heads)
            )
        self.output_attentions = config.output_attentions
        self.num_heads = config.num_attention_heads
        self.head_dim = int(config.hidden_size / config.num_attention_heads)
        self.embed_dim = config.hidden_size

        self.query = nn.Linear(config.hidden_size, self.embed_dim)
        self.key = nn.Linear(config.hidden_size, self.embed_dim)
        self.value = nn.Linear(config.hidden_size, self.embed_dim)

        self.dropout = config.attention_probs_dropout_prob

        self.layer_id = layer_id
        attention_window = config.attention_window[self.layer_id]
        assert (
            attention_window % 2 == 0
        ), f"`attention_window` for layer {self.layer_id} has to be an even value. Given {attention_window}"
        assert (
            attention_window > 0
        ), f"`attention_window` for layer {self.layer_id} has to be positive. Given {attention_window}"

        self.one_sided_attention_window_size = attention_window // 2

    @staticmethod
    def _skew(x, direction):
        """Convert diagonals into columns (or columns into diagonals depending on `direction`"""
        x_padded = F.pad(x, direction)  # padding value is not important because it will be overwritten
        x_padded = x_padded.view(*x_padded.size()[:-2], x_padded.size(-1), x_padded.size(-2))
        return x_padded

    @staticmethod
    def _skew2(x):
        """shift every row 1 step to right converting columns into diagonals"""
        # X = B x C x M x L
        B, C, M, L = x.size()
        x = F.pad(x, (0, M + 1))  # B x C x M x (L+M+1). Padding value is not important because it'll be overwritten
        x = x.view(B, C, -1)  # B x C x ML+MM+M
        x = x[:, :, :-M]  # B x C x ML+MM
        x = x.view(B, C, M, M + L)  # B x C, M x L+M
        x = x[:, :, :, :-1]
        return x

    @staticmethod
    def _chunk(x, w):
        """convert into overlapping chunkings. Chunk size = 2w, overlap size = w"""

        # non-overlapping chunks of size = 2w
        x = x.view(x.size(0), x.size(1) // (w * 2), w * 2, x.size(2))

        # use `as_strided` to make the chunks overlap with an overlap size = w
        chunk_size = list(x.size())
        chunk_size[1] = chunk_size[1] * 2 - 1

        chunk_stride = list(x.stride())
        chunk_stride[1] = chunk_stride[1] // 2
        return x.as_strided(size=chunk_size, stride=chunk_stride)

    def _mask_invalid_locations(self, input_tensor, w) -> torch.Tensor:
        affected_seqlen = w
        beginning_mask_2d = input_tensor.new_ones(w, w + 1).tril().flip(dims=[0])
        beginning_mask = beginning_mask_2d[None, :, None, :]
        ending_mask = beginning_mask.flip(dims=(1, 3))
        seqlen = input_tensor.size(1)
        beginning_input = input_tensor[:, :affected_seqlen, :, : w + 1]
        beginning_mask = beginning_mask[:, :seqlen].expand(beginning_input.size())
        beginning_input.masked_fill_(beginning_mask == 1, -float("inf"))  # `== 1` converts to bool or uint8
        ending_input = input_tensor[:, -affected_seqlen:, :, -(w + 1) :]
        ending_mask = ending_mask[:, -seqlen:].expand(ending_input.size())
        ending_input.masked_fill_(ending_mask == 1, -float("inf"))  # `== 1` converts to bool or uint8

    def _sliding_chunks_matmul_qk(self, q: torch.Tensor, k: torch.Tensor, w: int):
        """Matrix multiplication of query x key tensors using with a sliding window attention pattern.
        This implementation splits the input into overlapping chunks of size 2w (e.g. 512 for pretrained Longformer)
        with an overlap of size w"""
        batch_size, seqlen, num_heads, head_dim = q.size()
        assert seqlen % (w * 2) == 0, f"Sequence length should be multiple of {w * 2}. Given {seqlen}"
        assert q.size() == k.size()

        chunks_count = seqlen // w - 1

        # group batch_size and num_heads dimensions into one, then chunk seqlen into chunks of size w * 2
        q = q.transpose(1, 2).reshape(batch_size * num_heads, seqlen, head_dim)
        k = k.transpose(1, 2).reshape(batch_size * num_heads, seqlen, head_dim)

        chunk_q = self._chunk(q, w)
        chunk_k = self._chunk(k, w)

        # matrix multipication
        # bcxd: batch_size * num_heads x chunks x 2w x head_dim
        # bcyd: batch_size * num_heads x chunks x 2w x head_dim
        # bcxy: batch_size * num_heads x chunks x 2w x 2w
        chunk_attn = torch.einsum("bcxd,bcyd->bcxy", (chunk_q, chunk_k))  # multiply

        # convert diagonals into columns
        diagonal_chunk_attn = self._skew(chunk_attn, direction=(0, 0, 0, 1))

        # allocate space for the overall attention matrix where the chunks are compined. The last dimension
        # has (w * 2 + 1) columns. The first (w) columns are the w lower triangles (attention from a word to
        # w previous words). The following column is attention score from each word to itself, then
        # followed by w columns for the upper triangle.

        diagonal_attn = diagonal_chunk_attn.new_empty((batch_size * num_heads, chunks_count + 1, w, w * 2 + 1))

        # copy parts from diagonal_chunk_attn into the compined matrix of attentions
        # - copying the main diagonal and the upper triangle
        diagonal_attn[:, :-1, :, w:] = diagonal_chunk_attn[:, :, :w, : w + 1]
        diagonal_attn[:, -1, :, w:] = diagonal_chunk_attn[:, -1, w:, : w + 1]
        # - copying the lower triangle
        diagonal_attn[:, 1:, :, :w] = diagonal_chunk_attn[:, :, -(w + 1) : -1, w + 1 :]
        diagonal_attn[:, 0, 1:w, 1:w] = diagonal_chunk_attn[:, 0, : w - 1, 1 - w :]

        # separate batch_size and num_heads dimensions again
        diagonal_attn = diagonal_attn.view(batch_size, num_heads, seqlen, 2 * w + 1).transpose(2, 1)

        self._mask_invalid_locations(diagonal_attn, w)
        return diagonal_attn

    def _sliding_chunks_matmul_pv(self, prob: torch.Tensor, v: torch.Tensor, w: int):
        """Same as _sliding_chunks_matmul_qk but for prob and value tensors. It is expecting the same output
        format from _sliding_chunks_matmul_qk"""
        batch_size, seqlen, num_heads, head_dim = v.size()
        assert seqlen % (w * 2) == 0
        assert prob.size()[:3] == v.size()[:3]
        assert prob.size(3) == 2 * w + 1
        chunks_count = seqlen // w - 1
        # group batch_size and num_heads dimensions into one, then chunk seqlen into chunks of size 2w
        chunk_prob = prob.transpose(1, 2).reshape(batch_size * num_heads, seqlen // w, w, 2 * w + 1)

        # group batch_size and num_heads dimensions into one
        v = v.transpose(1, 2).reshape(batch_size * num_heads, seqlen, head_dim)

        # pad seqlen with w at the beginning of the sequence and another w at the end
        padded_v = F.pad(v, (0, 0, w, w), value=-1)

        # chunk padded_v into chunks of size 3w and an overlap of size w
        chunk_v_size = (batch_size * num_heads, chunks_count + 1, 3 * w, head_dim)
        chunk_v_stride = padded_v.stride()
        chunk_v_stride = chunk_v_stride[0], w * chunk_v_stride[1], chunk_v_stride[1], chunk_v_stride[2]
        chunk_v = padded_v.as_strided(size=chunk_v_size, stride=chunk_v_stride)

        skewed_prob = self._skew2(chunk_prob)

        context = torch.einsum("bcwd,bcdh->bcwh", (skewed_prob, chunk_v))
        return context.view(batch_size, num_heads, seqlen, head_dim).transpose(1, 2)

    def forward(
        self,
        hidden_states,
        attention_mask=None,
        head_mask=None,
        encoder_hidden_states=None,
        encoder_attention_mask=None,
    ):
        """
        LongformerSelfAttention expects `len(hidden_states)` to be multiple of `attention_window`.
        Padding to `attention_window` happens in LongformerModel.forward to avoid redoing the padding on each layer.

        The `attention_mask` is changed in `BertModel.forward` from 0, 1, 2 to
            -ve: no attention
              0: local attention
            +ve: global attention

        `encoder_hidden_states` and `encoder_attention_mask` are not supported and should be None
        """
        # TODO: add support for `encoder_hidden_states` and `encoder_attention_mask`
        assert encoder_hidden_states is None, "`encoder_hidden_states` is not supported and should be None"
        assert encoder_attention_mask is None, "`encoder_attention_mask` is not supported and shiould be None"

        if attention_mask is not None:
            attention_mask = attention_mask.squeeze(dim=2).squeeze(dim=1)
            key_padding_mask = attention_mask < 0
        else:
            key_padding_mask = None

        hidden_states = hidden_states.transpose(0, 1)
        seqlen, batch_size, embed_dim = hidden_states.size()
        assert embed_dim == self.embed_dim
        q = self.query(hidden_states)
        k = self.key(hidden_states)
        v = self.value(hidden_states)
        q /= math.sqrt(self.head_dim)

        q = q.view(seqlen, batch_size, self.num_heads, self.head_dim).transpose(0, 1)
        k = k.view(seqlen, batch_size, self.num_heads, self.head_dim).transpose(0, 1)
        # attn_weights = (batch_size, seqlen, num_heads, window*2+1)
        attn_weights = self._sliding_chunks_matmul_qk(q, k, self.one_sided_attention_window_size)
        self._mask_invalid_locations(attn_weights, self.one_sided_attention_window_size)

        assert list(attn_weights.size()) == [
            batch_size,
            seqlen,
            self.num_heads,
            self.one_sided_attention_window_size * 2 + 1,
        ]

        attn_weights_fp32 = F.softmax(attn_weights, dim=-1, dtype=torch.float32)  # use fp32 for numerical stability
        attn_weights = attn_weights_fp32.type_as(attn_weights)

        if key_padding_mask is not None:
            # softmax sometimes inserts NaN if all positions are masked, replace them with 0
            attn_weights = torch.masked_fill(attn_weights, key_padding_mask.unsqueeze(-1).unsqueeze(-1), 0.0)

        attn_probs = F.dropout(attn_weights, p=self.dropout, training=self.training)
        v = v.view(seqlen, batch_size, self.num_heads, self.head_dim).transpose(0, 1)
        attn = self._sliding_chunks_matmul_pv(attn_probs, v, self.one_sided_attention_window_size)

        assert attn.size() == (batch_size, seqlen, self.num_heads, self.head_dim), "Unexpected size"
        attn = attn.transpose(0, 1).reshape(seqlen, batch_size, embed_dim).contiguous()

        # context_layer = attn.transpose(0, 1) #### pm574 edited ----> seem wrong!
        context_layer = attn #### pm574 use this one instead

        if self.output_attentions:
            attn_weights = attn_weights.permute(0, 2, 1, 3)
        outputs = (context_layer, attn_weights) if self.output_attentions else (context_layer,)
        return outputs


class MyLocalSelfAttention(nn.Module):
    def __init__(self, config: BartConfig, layer_id: int, attention_window):
        """
        I'm using BART config for now, and LongerFormer config is created inside this function
        """
        super().__init__()

        # Probably no change needed
        localattn_config = LongformerConfig()
        localattn_config.attention_probs_dropout_prob = config.attention_dropout
        localattn_config.bos_token_id                 = config.bos_token_id
        localattn_config.eos_token_id                 = config.eos_token_id
        localattn_config.hidden_dropout_prob          = config.dropout
        localattn_config.hidden_size                  = config.d_model
        localattn_config.intermediate_size            = config.encoder_ffn_dim # I'm not sure
        localattn_config.max_position_embeddings      = config.max_position_embeddings
        localattn_config.num_attention_heads          = config.encoder_attention_heads
        localattn_config.num_hidden_layers            = config.encoder_layers
        localattn_config.pad_token_id                 = config.pad_token_id
        localattn_config.sep_token_id                 = config.eos_token_id
        localattn_config.vocab_size                   = config.vocab_size

        localattn_config.attention_window = attention_window

        # self_attn
        self.self_attn = LocalSelfAttention(localattn_config, layer_id)

        # output projection
        self.out_proj = nn.Linear(localattn_config.hidden_size, localattn_config.hidden_size, bias=True)

    def forward(
        self,
        query,
        key,
        key_padding_mask = None,
        layer_state = None,
        attn_mask = None,
        need_weights=False,
        global_attn_mask=None
        ):
        """
        I need to to have the same API as BART's SelfAttention.forward()

        The `attention_mask` is changed in `BertModel.forward` from 0, 1, 2 to
            -ve: no attention
              0: local attention
            +ve: global attention

        """
        # if need_weights: raise Exception("need_weights error")

        attention_mask = self.attention_mask_mapping(key_padding_mask)

        self_attn_outputs = self.self_attn.forward(
            hidden_states=query.transpose(0,1),
            attention_mask=attention_mask.unsqueeze(dim=1).unsqueeze(dim=2)
        )

        outputs = self.out_proj(self_attn_outputs[0])

        if need_weights:
            return outputs, self_attn_outputs[1]
        else:
            return outputs, None

    def attention_mask_mapping(self, mask, global_attn_mask=None):
        """
        The `attention_mask` is changed in `BertModel.forward` from 0, 1, 2 to
            -ve: no attention
              0: local attention
            +ve: global attention

        mask: from BART model... shape = (batch_size, seq_len)... value = [False, False, ..., True, True]
        global_attn_mask: designed for Longformer specifically... shape = (batch_size, seq_len)... value: 0=local, 1=global

        """
        new_mask = torch.zeros(mask.size(), dtype=torch.int, device=mask.device)
        if global_attn_mask is not None:
            new_mask = new_mask + global_attn_mask
        new_mask = torch.masked_fill(new_mask, mask, -1)
        return new_mask


class LoBART(BartForConditionalGeneration):
    def __init__(self, config: BartConfig):
        super().__init__(config)


    def swap_fullattn_to_localattn(self, attention_window):
        """
        based on HuggingFace v2.11.0

        BART: self.model.encoder.layers[0].self_attn
            - q_proj, k_proj, v_proj ---- Linear dim (embed_dim,embed_dim)
            - out_proj               ---- Linear dim (embed_dim,embed_dim)
            ***
            head_dim = embed_dim // num_heads

        """

        print("==================================================================================")
        print("===> attention_window:", attention_window)
        print("==================================================================================")


        for i in range(len(self.model.encoder.layers)):
            # local_attn = MyLocalSelfAttention(self.config, layer_id=0, attention_window=attention_window)
            local_attn = MyLocalSelfAttention(self.config, layer_id=i, attention_window=attention_window) # corrected!!

            # Copy 1
            local_attn.self_attn.query.weight.data = self.model.encoder.layers[i].self_attn.q_proj.weight.data
            local_attn.self_attn.key.weight.data = self.model.encoder.layers[i].self_attn.k_proj.weight.data
            local_attn.self_attn.value.weight.data = self.model.encoder.layers[i].self_attn.v_proj.weight.data
            # Copy 2
            # local_attn.self_attn.query_global.weight.data = self.model.encoder.layers[i].self_attn.q_proj.weight.data
            # local_attn.self_attn.key_global.weight.data = self.model.encoder.layers[i].self_attn.k_proj.weight.data
            # local_attn.self_attn.value_global.weight.data = self.model.encoder.layers[i].self_attn.v_proj.weight.data
            # Copy 3
            local_attn.out_proj.weight.data = self.model.encoder.layers[i].self_attn.out_proj.weight.data
            self.model.encoder.layers[i].self_attn = local_attn

        print("Swapped BART'encoder full self attention to local self attention")

    def expand_learned_embed_positions(self, multiple=4, cut=0):
        if multiple != 2 and multiple != 4 and multiple != 8:
            raise ValueError("only multiple = 2,4 supported")
        new_embed_positions_size = 1026 * multiple - cut # original is 1024+2
        new_enc_embed_positions = LearnedPositionalEmbedding(new_embed_positions_size, self.model.config.hidden_size, self.model.config.pad_token_id)
        new_enc_embed_positions.weight.data[:1026] = self.model.encoder.embed_positions.weight.data
        if multiple == 2 and cut == 4:
            #### yes cut == 2 here
            new_enc_embed_positions.weight.data[1026:] = torch.flip(self.model.encoder.embed_positions.weight.data, dims=[0])[:-2]
        else:
            new_enc_embed_positions.weight.data[1026:1026*2] = torch.flip(self.model.encoder.embed_positions.weight.data, dims=[0])
        if multiple == 4 or multiple == 8:
            new_enc_embed_positions.weight.data[1026*2:1026*3] = self.model.encoder.embed_positions.weight.data
            if multiple == 4 and cut > 0:
                new_enc_embed_positions.weight.data[1026*3:1026*4-cut] = torch.flip(self.model.encoder.embed_positions.weight.data, dims=[0])[:-cut]
            elif multiple == 4 and cut == 0:
                new_enc_embed_positions.weight.data[1026*3:1026*4-cut] = torch.flip(self.model.encoder.embed_positions.weight.data, dims=[0])
            else: # multiple == 8
                new_enc_embed_positions.weight.data[1026*3:1026*4] = torch.flip(self.model.encoder.embed_positions.weight.data, dims=[0])
                new_enc_embed_positions.weight.data[1026*4:] = new_enc_embed_positions.weight.data[:1026*4-14]
        else:
            if multiple == 2:
                pass
            else:
                raise ValueError("multiple not implemented yet!")

        self.model.encoder.embed_positions = new_enc_embed_positions
        self.config.max_position_embeddings = new_embed_positions_size

        print("expanded learned_embed_positions to {} tokens".format(self.model.config.max_position_embeddings))
