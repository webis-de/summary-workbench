/* eslint-disable */

/* Copyright 2012 Marcusb @ Vroniplag Wiki.
   Licensed under GNU General Public License v3 or later.
   Modified by Dominik Schwabe @ University Leipzig 2020 */

/* Requires no jquery.  */

// http://www.dweebd.com/javascript/binary-search-an-array-in-javascript/
const binarySearch = (list, find, comparator) => {
  let low = 0;
  let high = list.length - 1;
  let i;
  let comparison;
  while (low <= high) {
    i = Math.floor((low + high) / 2);
    comparison = comparator(list[i], find);
    if (comparison < 0) {
      low = i + 1;
    } else if (comparison > 0) {
      high = i - 1;
    } else {
      return i;
    }
  }
  return -1;
};

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

    if (tokens <= 0)
      /* Document is not long enough to have any matches.  */
      continue;

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

        /* In any case, we keep this location as a possible future
		   match.  */
        match_table[match_tag].push(match_loc);
      } else {
        match_table[match_tag] = [match_loc];
      }
    }
  }
  return final_match_list;
};

const wordspaceTokens = (text) => {
  const words = [];
  const tokens = text
    .replace(/ ?n['`’]t/g, "n't")
    .replace(/ ?['`’']s/g, "'s")
    .replace(/ ?['`’']m/g, "'m")
    .match(/[^\s-]+|[\s-]+/g);
  if (tokens.length > 0) {
    let i = 0;
    if (tokens[0].match(/[\s-]/)) {
      words.push([null, tokens[0]]);
      i = 1;
    }
    for (let len = tokens.length - 1; i < len; i += 2) {
      words.push([tokens[i], tokens[i + 1]]);
    }
    if (i === tokens.length - 1) {
      words.push([tokens[i], null]);
    }
  }
  return words;
};

class textblock {
  constructor(text) {
    this.wstokens = wordspaceTokens(text);

    /* words is an array of [word, position] where position is a
         scalar.  word may be null (indicating a leading whitespace)!  */
    this.words = this.wstokens.map((wordspace, i) => [wordspace[0], i]);

    /* Each element in markups is [start, end, classlist], where start
         and end are inclusive positions and classlist is an array of
         class names to apply.  To make the clipping a lot easier, we
         keep the list sorted and free of gaps (classlist is empty for
         an unused range).  */
    this.markups = [[0, this.words.length - 1, []]];
  }

  _cut_before = (pos) => {
    const markups = this.markups;

    /* Find the range that contains pos. */
    const loc = binarySearch(markups, pos, (markup, pos) => {
      if (markup[1] < pos) return -1;
      else if (markup[0] > pos) return 1;
      else return 0;
    });

    if (loc < 0)
      /* Should never happen. */
      return;

    const markup = markups[loc];
    if (pos === markup[0]) return;

    const end = markup[1];
    markup[1] = pos - 1;
    markups.splice(loc + 1, 0, [pos, end, markup[2].slice()]);
  };

  apply_class = (cssclass, startpos, endpos) => {
    /* Mark a region for a CSS class.  */

    /* Cutting the existing regions at the positions we want to
           apply a class makes the following algorithm a lot easier,
           because existing regions are then either completely
           contained in the new range or completely outside.  Because
           we start with the full range, all ranges exist, so no gaps
           need to be filled.  */

    if (endpos === startpos) {
      // skip single word if stopword
      const w = this.words[endpos][0].toLowerCase();
      if (
        w.match(
          /\b(a|about|above|after|again|against|all|am|an|and|any|are|as|at|be|because|been|before|being|below|between|both|but|by|can|did|do|does|doing|don|down|during|each|few|for|from|further|had|has|have|having|he|her|here|hers|herself|him|himself|his|how|i|if|in|into|is|it|its|itself|just|me|more|most|my|myself|no|nor|not|now|of|off|on|once|only|or|other|our|ours|ourselves|out|over|own|s|same|she|should|so|some|such|t|than|that|the|their|theirs|them|themselves|then|there|these|they|this|those|through|to|too|under|until|up|very|was|we|were|what|when|where|which|while|who|whom|why|will|with|you|your|yours|yourself|yourselves)\b/
        )
      ) {
        return;
      }
    }

    this._cut_before(startpos);
    this._cut_before(endpos + 1);

    /* Now we can copy the existing ranges into the new list,
           adding missing classes as we encounter them.  */
    const markups = this.markups;
    for (let i = 0, ilen = markups.length; i < ilen; ++i) {
      const markup = markups[i];
      const mstart = markup[0];
      const mend = markup[1];
      if (startpos <= mstart && mend <= endpos) {
        /* Add the cssclass if it is missing.  */
        if (markup[2].indexOf(cssclass) < 0) markup[2].push(cssclass);
      }
    }
  };

  markup = () => {
    const wstokens = this.wstokens;
    const markupedText = [];

    for (const mark of this.markups) {
      const [jstart, jend, classlist] = mark;
      let substr = "";
      for (let j = jstart; j <= jend; j++) {
        let [word, whitespace] = wstokens[j];
        if (word !== null) substr += word;
        if (j !== jend) substr += whitespace;
      }
      markupedText.push([substr, classlist]);
      /* Add last whitespace.  */
      const lastWhitespace = wstokens[jend][1];
      if (lastWhitespace !== null) markupedText.push([lastWhitespace, []]);
    }
    return markupedText;
  };
}

/* Extract a cleaned up list. */
const clean_list = (tokenidlist) => {
  const tokens = [];
  const ids = [];

  for (const tokenid of tokenidlist) {
    let [token, id] = tokenid;

    if (token === null) {
      continue;
    }

    token = token.replace("ß", "ss");
    token = token.replace(/[^a-zäöüA-ZÄÖÜ0-9\u0410-\u044F-]/g, "");
    token = token.toLowerCase();

    if (token !== "") {
      tokens.push(token);
      ids.push(id);
    }
  }

  return [tokens, ids];
};

const markup = (hyp, ref) => {
  const refTextblock = new textblock(ref);
  const hypTextblock = new textblock(hyp);

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
      "fragmark" + (col + 1),
      ids[doc_1][start_1],
      ids[doc_1][start_1 + length - 1]
    );
    textblocks[doc_2].apply_class(
      "fragmark" + (col + 1),
      ids[doc_2][start_2],
      ids[doc_2][start_2 + length - 1]
    );

    col = (col + 1) % nr_col;
  }

  return [hypTextblock.markup(), refTextblock.markup()];
};

export { markup };
