/* eslint-disable */

/* Copyright 2012 Marcusb @ Vroniplag Wiki.
   Licensed under GNU General Public License v3 or later.
   Modified by Dominik Schwabe @ University of Leipzig 2020 */

/* Text comparison.  */
const cmp_text = (documents, min_run_length) => {
  const no_self_similarities = true;

  /* documents is an array of token lists.  Each token list is an array of tokens.
       tokens are strings that must not contain the special "\x01" character.

       The return is a list of matches in the form:

       [ doc_1, start_1, doc_2, start_token_2, length ]

       where doc_X are indices into the documents array, and start_X
       are indices into the respective token list of the documents.
    */
  const final_match_list = [];

  /* For each min_length token run in each document, we store [ doc, start ]. */
  const match_table = {};

  const docs = documents.length;
  const documents_len = [];

  for (let doc_idx = 0; doc_idx < docs; doc_idx++) {
    const doc = documents[doc_idx];

    const tokens = doc.length - min_run_length + 1;
    const doc_len = doc.length;

    /* Record the length of each document.  */
    documents_len[doc_idx] = doc_len;

    /* Document is not long enough to have any matches.  */
    if (tokens <= 0) continue;

    /* We don't report another match until we have skipped over
	   all the tokens in the last match.  */
    let min_token_idx = 0;

    for (let token_idx = 0; token_idx < tokens; token_idx++) {
      const match = doc.slice(token_idx, token_idx + min_run_length);
      const match_loc = [doc_idx, token_idx];

      const match_tag = match.join("\x01");

      if (match_tag in match_table) {
        if (token_idx >= min_token_idx) {
          /* If there are matches, find the best and record it.  */
          const best_match = [doc_idx, token_idx, null, 0, 0];
          const matches = match_table[match_tag];
          const nr_matches = matches.length;

          for (let idx = 0; idx < nr_matches; idx++) {
            const match_peer = matches[idx];
            const peer_doc_idx = match_peer[0];
            const peer_doc = documents[peer_doc_idx];
            let peer_token_idx = match_peer[1] + min_run_length;
            const peer_len = documents_len[peer_doc_idx];
            let our_token_idx = token_idx + min_run_length;

            if (no_self_similarities && peer_doc_idx === doc_idx) {
              /* Self similarity, skip for now.  FIXME:
			       Make this an option.  Note: If we allow
			       self-similarities, there can be
			       overlapping matches like in: "a b c d a
			       b c d a b c d" which has matches "[1: a
			       b c d [2: a b c d :1] a b c d :2],
			       which is a coloring problem.  */
              continue;
            }

            while (
              peer_token_idx < peer_len &&
              our_token_idx < doc_len &&
              peer_doc[peer_token_idx] === doc[our_token_idx]
            ) {
              peer_token_idx++;
              our_token_idx++;
            }
            const len = our_token_idx - token_idx;
            if (len > best_match[4]) {
              /* We found a better match.  */
              best_match[2] = match_peer[0];
              best_match[3] = match_peer[1];
              best_match[4] = len;
            }
          }
          /* Any good match found?  Record it. */
          if (best_match[2] !== null) {
            final_match_list.push(best_match);
            min_token_idx = token_idx + best_match[4];
          }
        }

        /* In any case, we keep this location as a possible future match.  */
        match_table[match_tag].push(match_loc);
      } else {
        match_table[match_tag] = [match_loc];
      }
    }
  }
  return final_match_list;
};

const space_chars = String.raw`\s-,.`;
const space_re = new RegExp(`^[${space_chars}]*$`);
const tokenzie_re = new RegExp(`[^${space_chars}]+|[${space_chars}]+`, "g");

const wordspaceTokens = (text) => {
  const wstokens =
    text
      .replace(/ ?n['`’]t/g, "n't")
      .replace(/ ?['`’']s/g, "'s")
      .replace(/ ?['`’']m/g, "'m")
      .match(tokenzie_re) || [];
  let first_whitespace = null;
  if (wstokens.length && wstokens[0].match(space_re))
    first_whitespace = wstokens.shift();
  return [first_whitespace, wstokens];
};

const comp = (a, b) => {
  if (a[0] < b[0]) return -1;
  else if (a[0] > b[0]) return 1;
  else if (a[1] < b[1]) return 1;
  else if (a[1] > b[1]) return -1;
  return 0;
};

const _collapse = (nodes, lower, upper) => {
  const results = [];
  while (nodes.length) {
    const [left, right, tag] = nodes[0];
    if (left <= upper) {
      if (right > upper) throw new Error("overlapping ranges");
      nodes.shift();
      const children = _collapse(nodes, left, right);
      const range = [left - lower, right - lower, tag];
      if (children.length) range.push(children);
      results.push(range);
    } else return results;
  }
  return results;
};

const collapse = (nodes) => {
  const results = [];
  while (nodes.length) {
    const [left, right, tag] = nodes.shift();
    const children = _collapse(nodes, left, right);
    const range = [left, right, tag];
    if (children.length) range.push(children);
    results.push(range);
  }
  return results;
};

const translate = (coll_markups, wstokens) => {
  const result = [];
  let last_end = 0;
  coll_markups.forEach(([start, end, tag, children]) => {
    const first_token_pos = 2 * start;
    const last_token_pos = 2 * end + 1;
    // extract unmarked beginning or between
    if (start > 0) result.push(wstokens.slice(last_end, first_token_pos).join(""));
    const sub_tokens = wstokens.slice(first_token_pos, last_token_pos);
    const hash = hashCode(sub_tokens.filter((_, i) => i % 2 == 0).map(clean).join(""))
    // markup children or convert to string
    if (children) result.push([translate(children, sub_tokens), tag, hash]);
    else result.push([[sub_tokens.join("")], tag, hash]);
    last_end = last_token_pos;
  });
  // extract umarked end
  const end = wstokens.slice(last_end);
  if (end.length) result.push(end.join(""));
  return result;
};

const stopword_re = /\b(a|about|above|after|again|against|all|am|an|and|any|are|as|at|be|because|been|before|being|below|between|both|but|by|can|did|do|does|doing|don|down|during|each|few|for|from|further|had|has|have|having|he|her|here|hers|herself|him|himself|his|how|i|if|in|into|is|it|its|itself|just|me|more|most|my|myself|no|nor|not|now|of|off|on|once|only|or|other|our|ours|ourselves|out|over|own|s|same|she|should|so|some|such|t|than|that|the|their|theirs|them|themselves|then|there|these|they|this|those|through|to|too|under|until|up|very|was|we|were|what|when|where|which|while|who|whom|why|will|with|you|your|yours|yourself|yourselves)\b/;

class Textblock {
  constructor(text) {
    [this.first_whitespace, this.wstokens] = wordspaceTokens(text);
    this.words = this.wstokens
      .filter((_, i) => i % 2 == 0)
      .map((word) => word.toLowerCase());
    this.markups = [];
  }

  apply_class = (start, end, tag) => {
    if (end === start && this.words[end].match(stopword_re)) return;
    this.markups.push([start, end, tag]);
  };

  markup = () => {
    this.markups.sort(comp);
    const coll_markups = collapse(this.markups);
    const translated = translate(coll_markups, this.wstokens);
    // add first_whitespace if present
    if (this.first_whitespace) {
      if (translated.length && typeof translated[0] === "string")
        translated[0] = this.first_whitespace + translated[0];
      else translated.unshift(this.first_whitespace);
    }
    return translated;
  };
}

const clean = (word) => {
  word = word.replace("ß", "ss");
  word = word.replace(/[^a-zäöüA-ZÄÖÜ0-9\u0410-\u044F-]/g, "");
  word = word.toLowerCase();
  return word
}
/* Extract a cleaned up list. */
const clean_list = (words) => {
  const tokens = [];
  const ids = [];

  words.forEach((word, i) => {
    word = clean(word)
    if (word !== "") {
      tokens.push(word);
      ids.push(i);
    }
  });

  return [tokens, ids];
};

const markup = (ref, hyp) => {
  const refTextblock = new Textblock(ref);
  const hypTextblock = new Textblock(hyp);

  const [hypDoc, hypIds] = clean_list(hypTextblock.words);
  const [refDoc, refIds] = clean_list(refTextblock.words);

  const textblocks = [refTextblock, hypTextblock];
  const docs = [refDoc, hypDoc];
  const ids = [refIds, hypIds];

  const len = 3;
  const sims = cmp_text(docs, len);

  const nr_col = 9;
  let col = 0;

  for (const [doc_1, start_1, doc_2, start_2, length] of sims) {
    textblocks[doc_1].apply_class(
      ids[doc_1][start_1],
      ids[doc_1][start_1 + length - 1],
      col
    );
    textblocks[doc_2].apply_class(
      ids[doc_2][start_2],
      ids[doc_2][start_2 + length - 1],
      col
    );
    col++;
  }

  return [refTextblock.markup(), hypTextblock.markup()];
};

const hashCode = (str) => {
  let hash = 0;
  let i = str.length;
  while (i--) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return hash;
};

const intToRGB = (i) => {
  const c = (i & 0xffffff).toString(16).toUpperCase();
  return "00000".substring(0, 6 - c.length) + c;
};

const hexToRgb = (hex) => {
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b]
}

const foregroundColor = (backgroundColor) => {
  const [r, g, b] = hexToRgb(backgroundColor)
  return ((r*0.299 + g*0.587 + b*0.114) > 150) ? "000000" : "ffffff"
}

const colorMarkup = (num) => {
  const bgcolor = intToRGB(num)
  const fgcolor = foregroundColor(bgcolor)
  return [`#${bgcolor}`, `#${fgcolor}`]
}

export {markup, colorMarkup}
