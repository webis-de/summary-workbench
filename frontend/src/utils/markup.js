/* eslint-disable */

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

const build_inverted_index = (doc) => {
  const index = new Map();
  doc.forEach((token, pos) => {
    const entry = index.get(token);
    if (entry) entry.push(pos);
    else index.set(token, [pos]);
  });
  return index;
};

const compute_matches = (doc1, doc2) => {
  const inverted_index = build_inverted_index(doc2);
  const longest_match = new Map();
  doc1.forEach((token, pos) => {
    const matches = inverted_index.get(token);
    if (matches) {
      const match_map = new Map();
      matches.forEach((pos) => match_map.set(pos, 1));
      longest_match.set(pos, match_map);
    }
  });
  let changed_pos = [...longest_match.keys()];
  while (changed_pos.length) {
    changed_pos = changed_pos.filter((source_pos) => {
      let add_pos = false;
      const matches = longest_match.get(source_pos);
      matches.forEach((match_len, target_pos) => {
        const next_source_pos = source_pos + match_len;
        const next_target_pos = target_pos + match_len;
        const match_map = longest_match.get(next_source_pos);
        if (match_map) {
          const extend_len = match_map.get(next_target_pos);
          if (extend_len) {
            longest_match
              .get(source_pos)
              .set(target_pos, extend_len + match_len);
            add_pos = true;
          }
        }
      });
      return add_pos;
    });
  }
  return longest_match;
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

const insert_pos = (left, right, tag, color, nodes) => {
  let index = 0;
  while (index < nodes.length) {
    const [curr_left, curr_right] = nodes[index];
    if (left > curr_left || (left == curr_left && right < curr_right)) index++;
    else break;
  }
  nodes.splice(index, 0, [left, right, tag, color]);
};

const _collapse = (nodes, lower, upper) => {
  const results = [];
  while (nodes.length) {
    const [left, right, tag, color] = nodes[0];
    if (left <= upper) {
      nodes.shift();
      if (right > upper) {
        insert_pos(upper + 1, right, tag, color, nodes);
        nodes.unshift([left, upper, tag, color]);
        continue;
      }
      const children = _collapse(nodes, left, right);
      const range = [left - lower, right - lower, tag, color];
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
  coll_markups.forEach(([start, end, tag, color, children]) => {
    const first_token_pos = 2 * start;
    const last_token_pos = 2 * end + 1;
    // extract unmarked beginning or between
    if (start > 0)
      result.push(wstokens.slice(last_end, first_token_pos).join(""));
    const sub_tokens = wstokens.slice(first_token_pos, last_token_pos);
    // markup children or convert to string
    if (children) result.push([translate(children, sub_tokens), tag, ...color]);
    else result.push([[sub_tokens.join("")], tag, ...color]);
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

  apply_class = (start, end, tag, color) => {
    if (end === start && this.words[end].match(stopword_re)) return;
    this.markups.push([start, end, tag, color]);
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
  return word;
};
/* Extract a cleaned up list. */
const clean_list = (words) => {
  const tokens = [];
  const ids = [];

  words.forEach((word, i) => {
    word = clean(word);
    if (word !== "") {
      tokens.push(word);
      ids.push(i);
    }
  });

  return [tokens, ids];
};

const remove_short_matches = (matches, min_length) => {
  const long_matches = new Map();
  matches.forEach((match_map, source_pos) => {
    const entries = [];
    match_map.forEach((match_length, target_pos) => {
      if (match_length >= min_length) entries.push([target_pos, match_length]);
    });
    if (entries.length) {
      const filtered_map = new Map();
      entries.forEach(([target_pos, match_length]) =>
        filtered_map.set(target_pos, match_length)
      );
      long_matches.set(source_pos, filtered_map);
    }
  });
  return long_matches;
};

const remove_nested_matches = (matches) => {
  matches.forEach((match_map, source_pos) => {
    match_map.forEach((match_len, target_pos) => {
      for (let i = 1; i < match_len; i++)
        matches.get(source_pos + i).delete(target_pos + i);
    });
  });
  return matches;
};

const group_matches = (matches) => {
  if (!matches.size) return [];
  const group_list = [];
  matches.forEach((match_map, source_pos) => {
    const extract_map = new Map();
    match_map.forEach((match_length, target_pos) => {
      const min_pos = extract_map.get(match_length);
      if (!min_pos || min_pos > target_pos)
        extract_map.set(match_length, target_pos);
    });
    extract_map.forEach((target_pos, match_length) =>
      group_list.push([match_length, target_pos, source_pos])
    );
  });
  group_list.sort(comp);
  const groups = [];
  let [last_group_length, last_group_target, source_pos] = group_list[0];
  let curr_group = [last_group_length, [source_pos]];
  group_list
    .slice(1)
    .forEach(([curr_group_length, curr_group_target, source_pos]) => {
      if (
        last_group_length !== curr_group_length ||
        last_group_target !== curr_group_target
      ) {
        groups.push(curr_group);
        curr_group = [curr_group_length, []];
      }
      curr_group[1].push(source_pos);
      last_group_length = curr_group_length;
      last_group_target = curr_group_target;
    });
  if (curr_group.length) groups.push(curr_group);
  const final_groups = [];
  groups.forEach(([match_length, source_elements]) => {
    const target_elements = [];
    matches.get(source_elements[0]).forEach((length, element) => {
      if (length === match_length) target_elements.push(element);
    });
    final_groups.push([match_length, source_elements, target_elements]);
  });
  return final_groups;
};

const extract_matches = (matches, min_length) => {
  matches = remove_nested_matches(matches);
  matches = remove_short_matches(matches, min_length);
  return group_matches(matches);
};

const len = 2;
const computeMarkup = (source_document, target_document) => {
  const source_textblock = new Textblock(source_document);
  const target_textblock = new Textblock(target_document);

  const [target_doc, target_ids] = clean_list(target_textblock.words);
  const [source_doc, source_ids] = clean_list(source_textblock.words);

  const clean_words1 = target_textblock.words.map(clean);

  const textblocks = [source_textblock, target_textblock];

  let matches = extract_matches(compute_matches(source_doc, target_doc), len);

  let tag = 0;

  matches.forEach(([match_length, source_group, target_group]) => {
    const start = source_group[0];
    const end = start + match_length - 1
    const color = colorMarkup(hashCode(clean_words1.slice(start, end).join(""))
    );
    source_group.forEach((source) => {
      source_textblock.apply_class(
        source,
        source + match_length - 1,
        tag,
        color
      );
    });
    target_group.forEach((target) => {
      target_textblock.apply_class(
        target,
        target + match_length - 1,
        tag,
        color
      );
    });
    tag++;
  });

  return [source_textblock.markup(), target_textblock.markup()];
};

export {computeMarkup}
