/* eslint-disable */

const compute_ranks = (doc) => {
  const rank_map = new Map();
  let rank = 1;
  doc.forEach((word) => {
    if (!rank_map.has(word)) rank_map.set(word, rank++);
  });
  return rank_map;
};

const pair_comp = (a, b) => {
  if (a[0] < b[0]) return -1;
  if (a[0] > b[0]) return 1;
  if (a[1] < b[1]) return -1;
  if (a[1] > b[1]) return 1;
  return 0;
};

const get_rank = (pairs) => {
  const tmp = pairs.map(() => 0);
  const sort_pairs = pairs.map((pair, i) => [pair, i]);
  sort_pairs.sort((a, b) => pair_comp(a[0], b[0]));
  for (let i = 0; i < pairs.length; i++) tmp[sort_pairs[i][1]] = i;
  const ranks = pairs.map(() => 0);
  let rank = 0;
  for (let i = 1; i < pairs.length; i++) {
    if (pair_comp(sort_pairs[i - 1][0], sort_pairs[i][0]) !== 0) rank++;
    ranks[sort_pairs[i][1]] = rank;
  }
  return ranks;
};

// prefix doubling in O(n log^2 (n))
const build_suffix_array = (doc) => {
  if (!doc.length) return [];
  const n = doc.length;
  const max_n = 2 * n;
  const rank_map = compute_ranks(doc);
  let rank = doc.map((token) => rank_map.get(token));
  let k = 1;
  do {
    const pairs = [];
    for (let i = 0; i < n; i++) {
      const next_ind = i + k;
      pairs.push([rank[i], next_ind < n ? rank[next_ind] : -1]);
    }
    rank = get_rank(pairs);
    k *= 2;
  } while (k < max_n);
  const suffix_array = doc.map(() => 0);
  for (let i = 0; i < n; i++) suffix_array[rank[i]] = i;
  return suffix_array;
};

const build_inverse_suffix_array = (suffix_array) => {
  const inverse_suffix_array = suffix_array.map(() => 0);
  for (let i = 0; i < suffix_array.length; i++) inverse_suffix_array[suffix_array[i]] = i;
  return inverse_suffix_array;
};

// kasai's algorithm in O(n)
const build_lcp_array = (doc, suffix_array, inverse_suffix_array) => {
  const n = suffix_array.length;
  const lcp = suffix_array.map(() => 0);

  let h = 0;
  for (let i = 0; i < n; i++) {
    if (inverse_suffix_array[i] === 0) continue;
    const k = suffix_array[inverse_suffix_array[i] - 1];
    while (doc[i + h] === doc[k + h]) h++;
    lcp[inverse_suffix_array[i]] = h;
    if (h > 0) h--;
  }
  return lcp;
};

const combine_documents = (docs) => {
  const first_doc = docs[0];
  const document_vector = first_doc.map(() => 0);
  const rest_docs = [];
  for (let i = 1; i < docs.length; i++) {
    rest_docs.push([i]);
    document_vector.push(i);
    rest_docs.push(docs[i]);
    docs[i].forEach(() => document_vector.push(i));
  }
  const offsets = [0];
  let last = 0;
  docs.forEach((doc) => {
    last += doc.length + 1;
    offsets.push(last);
  });
  return [first_doc.concat(...rest_docs), document_vector, offsets];
};

const is_self_similar = (start, end, document_vector, suffix_array) => {
  for (let i = start; i < end; i++) if (document_vector[suffix_array[i]] !== document_vector[suffix_array[i+1]] ) return false
  return true
}

const update_longest_match = (start, end, match_length, longest_match_array) => {
  for (let i = start; i <= end; i++) if (longest_match_array[i] < match_length) longest_match_array[i] = match_length
}

const is_nested = (start, end, match_length, suffix_array, inverse_suffix_array, longest_match_array) => {
  for (let i = start; i <= end; i++) {
    if (longest_match_array[i] === match_length && suffix_array[i] !== 0) {
      const longest_match_before = longest_match_array[inverse_suffix_array[suffix_array[i] - 1]];
      if (longest_match_before < match_length + 1) return false
    }
  }
  return true
}

const compute_matches = (docs, min_length, allow_self_similarities) => {
  const [combined_doc, document_vector, offsets] = combine_documents(docs);
  const suffix_array = build_suffix_array(combined_doc);
  const inverse_suffix_array = build_inverse_suffix_array(suffix_array);
  const lcp_array = build_lcp_array(combined_doc, suffix_array, inverse_suffix_array);
  const longest_match_array = Array(lcp_array.length).fill(0)
  lcp_array.shift();
  lcp_array.push(0);
  const match_groups = [];
  const start = [];
  const depth = [];
  let curr_start = 0;
  let curr_depth = 0;

  let i = 0
  while (i < lcp_array.length) {
    if (lcp_array[i] > curr_depth) {
      start.push(curr_start);
      depth.push(curr_depth);
      curr_depth = lcp_array[i];
      curr_start = i;
    } else if (lcp_array[i] < curr_depth) {
      if (curr_depth >= min_length) {
        if (allow_self_similarities || !is_self_similar(curr_start, i, document_vector, suffix_array)) {
          match_groups.push([curr_start, curr_depth, i]);
          update_longest_match(curr_start, i, curr_depth, longest_match_array)
        }
      }
      const prev_depth = depth[depth.length - 1];
      if (prev_depth < lcp_array[i]) {
        curr_depth = lcp_array[i];
      } else {
        curr_start = start.pop();
        curr_depth = depth.pop();
      }
    } else i++
  }

  const matches = [];
  match_groups.forEach(([index, match_length, end]) => {
    if (is_nested(index, end, match_length, suffix_array, inverse_suffix_array, longest_match_array)) return
    const curr_matches = docs.map(() => []);
    let pos = suffix_array[index];
    let doc_idx = document_vector[pos];
    let doc_start = pos - offsets[doc_idx];
    curr_matches[doc_idx].push(doc_start);
    const text = combined_doc.slice(pos, pos + match_length).join("");
    for (let j = index + 1; j <= end; j++) {
      pos = suffix_array[j];
      doc_idx = document_vector[pos];
      doc_start = pos - offsets[doc_idx];
      curr_matches[doc_idx].push(doc_start);
    }
    matches.push([match_length, text, curr_matches]);
  });
  return matches;
};

const markup_comp = (a, b) => {
  if (a[0] < b[0]) return -1;
  if (a[0] > b[0]) return 1;
  if (a[1] < b[1]) return 1;
  if (a[1] > b[1]) return -1;
  return 0;
};

const insert_pos = (left, right, information, nodes) => {
  let index = 0;
  while (index < nodes.length) {
    const [curr_left, curr_right] = nodes[index];
    if (left > curr_left || (left === curr_left && right < curr_right)) index++;
    else break;
  }
  nodes.splice(index, 0, [left, right, information]);
};

const _collapse = (nodes, lower, upper) => {
  const results = [];
  while (nodes.length) {
    const [left, right, information] = nodes[0];
    if (left <= upper) {
      nodes.shift();
      if (right > upper) {
        insert_pos(upper + 1, right, information, nodes);
        nodes.unshift([left, upper, information]);
        continue;
      }
      const children = _collapse(nodes, left, right);
      const range = [left - lower, right - lower, information];
      if (children.length) range.push(children);
      results.push(range);
    } else return results;
  }
  return results;
};

const collapse = (nodes) => {
  const results = [];
  while (nodes.length) {
    const range = nodes.shift();
    const [left, right] = range;
    const children = _collapse(nodes, left, right);
    if (children.length) range.push(children);
    results.push(range);
  }
  return results;
};

const translate = (coll_markups, wstokens) => {
  const result = [];
  let last_end = 0;
  coll_markups.forEach(([start, end, information, children]) => {
    const first_token_pos = 2 * start;
    const last_token_pos = 2 * end + 1;
    // extract unmarked beginning or between
    if (start > 0) result.push(wstokens.slice(last_end, first_token_pos).join(""));
    const sub_tokens = wstokens.slice(first_token_pos, last_token_pos);
    // markup children or convert to string
    if (children) result.push([translate(children, sub_tokens), information]);
    else result.push([[sub_tokens.join("")], information]);
    last_end = last_token_pos;
  });
  // extract umarked end
  const end = wstokens.slice(last_end);
  if (end.length) result.push(end.join(""));
  return result;
};

const space_chars = String.raw`\s-,.`;
const space_re = new RegExp(`^[${space_chars}]*$`);
const tokenzie_re = new RegExp(`[^${space_chars}]+|[${space_chars}]+`, "g");
const stopword_re = /\b(a|about|above|after|again|against|all|am|an|and|any|are|as|at|be|because|been|before|being|below|between|both|but|by|can|did|do|does|doing|don|down|during|each|few|for|from|further|had|has|have|having|he|her|here|hers|herself|him|himself|his|how|i|if|in|into|is|it|its|itself|just|me|more|most|my|myself|no|nor|not|now|of|off|on|once|only|or|other|our|ours|ourselves|out|over|own|s|same|she|should|so|some|such|t|than|that|the|their|theirs|them|themselves|then|there|these|they|this|those|through|to|too|under|until|up|very|was|we|were|what|when|where|which|while|who|whom|why|will|with|you|your|yours|yourself|yourselves)\b/;

const wordspaceTokens = (text) => {
  const wstokens = text.match(tokenzie_re) || [];
  let first_whitespace = null;
  if (wstokens.length && wstokens[0].match(space_re)) first_whitespace = wstokens.shift();
  return [first_whitespace, wstokens];
};

class Textblock {
  constructor(text) {
    [this.first_whitespace, this.wstokens] = wordspaceTokens(text);
    this.words = this.wstokens.filter((_, i) => i % 2 === 0);
    this.markups = [];
  }

  add_range = (start, end, information) => {
    if (start === end && this.words[start].match(stopword_re)) return;
    this.markups.push([start, end, information]);
  };

  markup = () => {
    this.markups.sort(markup_comp);
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
  word = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  word = word.replace(/[^a-zA-Z0-9\u0410-\u044F-]/g, "");
  word = word.toLowerCase();
  return word;
};

const clean_list = (words) => {
  const tokens = [];
  const idx = [];
  words.forEach((word, i) => {
    word = clean(word);
    if (word && !word.match(stopword_re)) {
      tokens.push(word);
      idx.push(i);
    }
  });
  return [tokens, idx];
};

const cyrb53 = function(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
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
  return [r, g, b];
};

const foregroundColor = (backgroundColor) => {
  const [r, g, b] = hexToRgb(backgroundColor);
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "000000" : "ffffff";
};

const colorMarkup = (num) => {
  const bgcolor = intToRGB(num);
  const fgcolor = foregroundColor(bgcolor);
  return [`#${bgcolor}`, `#${fgcolor}`];
};

const computeMarkup = (docs, min_length, allow_self_similarities) => {
  const textblocks = docs.map((doc) => new Textblock(doc));
  const clean_docs_idx = textblocks.map((textblock) => clean_list(textblock.words));

  const matches = compute_matches(
    clean_docs_idx.map(([clean_docs]) => clean_docs),
    min_length,
    allow_self_similarities
  );

  let tag = 0;
  matches.forEach(([match_length, text, groups]) => {
    const color = colorMarkup(cyrb53(text));
    const groupSizes = groups.map(start => start.length)
    groups.forEach((group, i) => {
      group.sort()
      return group.forEach((start, j) => {
        const map_start = clean_docs_idx[i][1][start];
        const map_end = clean_docs_idx[i][1][start + match_length - 1];
        textblocks[i].add_range(map_start, map_end, [tag, ...color, j, groupSizes]);
      })
    });
    tag++;
  });

  return textblocks.map((textblock) => textblock.markup());
};

export { computeMarkup };
