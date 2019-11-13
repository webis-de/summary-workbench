/* Copyright 2012 Marcusb @ Vroniplag Wiki.
   Licensed under GNU General Public License v3 or later.  */
 
/* Requires jquery.  */
 
// http://www.dweebd.com/javascript/binary-search-an-array-in-javascript/
Array.prototype.binarySearch = function(find, comparator) {
    var low = 0, high = this.length - 1,
    i, comparison;
    while (low <= high) {
	i = Math.floor((low + high) / 2);
	comparison = comparator(this[i], find);
	if (comparison < 0) { low = i + 1; }
	else if (comparison > 0) { high = i - 1; }
	else { return i; }
    }
    return -1;
};
 
 
/* Default to colored frags?  */
var frag_color_default = true;
 
/* Global list of callbacks to toggle frags.  FIXME: Proper usability would keep track of state of
   individual frags and cycle through none-current-all in a smart manner (skipping none or all if
   identical to current).  */
var frag_list = [];
 
 
/* Text comparison.  */
function cmp_text(documents, min_run_length)
{
    var no_self_similarities = true;
 
    /* documents is an array of token lists.  Each token list is an array of tokens.
       tokens are strings that must not contain the special "\x01" character.
 
       The return is a list of matches in the form:
 
       [ doc_1, start_1, doc_2, start_token_2, length ]
 
       where doc_X are indices into the documents array, and start_X
       are indices into the respective token list of the documents.
    */
    var final_match_list = [];
 
    /* For each min_length token run in each document, we store [ doc,
       start ].  */
    var match_table = { };
 
    var docs = documents.length;
    var documents_len = [];
 
    for (var doc_idx = 0; doc_idx < docs; doc_idx++)
    {
	var doc = documents[doc_idx];
 
	var tokens = doc.length - min_run_length + 1;
	var doc_len = doc.length;
 
	/* Record the length of each document.  */
	documents_len[doc_idx] = doc_len;
 
	if (tokens <= 0)
	    /* Document is not long enough to have any matches.  */
	    continue;
 
	/* We don't report another match until we have skipped over
	   all the tokens in the last match.  */
	var min_token_idx = 0;
 
	for (var token_idx = 0; token_idx < tokens; token_idx++)
	{
	    var match = doc.slice(token_idx, token_idx + min_run_length);
	    var match_loc = [ doc_idx, token_idx ];
 
	    var match_tag = match.join("\x01");
 
	    if (match_tag in match_table)
	    {
		if (token_idx >= min_token_idx)
		{
		    /* If there are matches, find the best and record it.  */
		    var best_match = [ doc_idx, token_idx, null, 0, 0 ];
		    var matches = match_table[match_tag];
		    var nr_matches = matches.length;
 
		    for (var idx = 0; idx < nr_matches; idx++)
		    {
			var match_peer = matches[idx];
			var peer_doc_idx = match_peer[0];
			var peer_doc = documents[peer_doc_idx];
			var peer_token_idx = match_peer[1] + min_run_length;
			var peer_len = documents_len[peer_doc_idx];
			var our_token_idx = token_idx + min_run_length;
 
			if (no_self_similarities && peer_doc_idx == doc_idx)
			{
			    /* Self similarity, skip for now.  FIXME:
			       Make this an option.  Note: If we allow
			       self-similarities, there can be
			       overlapping matches like in: "a b c d a
			       b c d a b c d" which has matches "[1: a
			       b c d [2: a b c d :1] a b c d :2],
			       which is a coloring problem.  */
			    continue;
			}
 
			while (peer_token_idx < peer_len
			       && our_token_idx < doc_len
			       && peer_doc[peer_token_idx] == doc[our_token_idx])
			{
			    peer_token_idx++;
			    our_token_idx++;
			}
			var len = our_token_idx - token_idx;
			if (len > best_match[4])
			{
			    /* We found a better match.  */
			    best_match[2] = match_peer[0];
			    best_match[3] = match_peer[1];
			    best_match[4] = len;
			}
		    }
		    /* Any good match found?  Record it. */
		    if (best_match[2] != null)
		    {
			final_match_list.push(best_match);
			min_token_idx = token_idx + best_match[4];
		    }
		}
 
		/* In any case, we keep this location as a possible future
		   match.  */
		match_table[match_tag].push(match_loc);
	    }
	    else
	    {
		match_table[match_tag] = [ match_loc ];
	    }
	}
    }
    return final_match_list;
}
 
 
/* Simple text markup framework.  */
 
/* A textnode is a chunk of plain text within the DOM tree.  */
function textnode(node)
{
    /* Save the original node.  */
    this.textnode = node;
     
    /* This is the target node for replacement.  */
    this.target = $(node);
     
    /* words is an array of [word, whitespace].  The first word and
       the last whitespace may be null.  */
    this.words = [];
    var tokens = node.nodeValue
        .replace(/ ?n['`’]t/g, "n't")
        .replace(/ ?['`’']s/g, "'s")
        .replace(/ ?['`’']m/g, "'m")
        .match(/[^\s\-]+|[\s\-]+/g);
    if (tokens.length > 0)
    {
        var words = this.words;
        var i = 0;
        if (tokens[0].match(/[\s\-]/))
        {
            words.push([null, tokens[0]]);
            i = 1;
        }
        for (var len = tokens.length - 1; i < len; i += 2)
        {
            words.push([tokens[i], tokens[i + 1]]);
        }
        if (i == tokens.length - 1)
        {
            words.push([tokens[i], null]);
        }
    }
     
    /* Marks is a sorted array of [start, end, classlist] where start
       and end are relative to this textnode.  The list of ranges is
       complete, ie it covers all words (classlist may be empty).  */
    this.apply_classes = function(marks)
    {
        var ostr = "";

        var words = this.words;
        for (var i = 0, ilen = marks.length; i < ilen; ++i)
        {
            var mark = marks[i];
             
            var classlist = mark[2];
            if (classlist.length > 0)
            {
                ostr += '<span class="' + classlist.join(" ") + '">';
            }
            else
            {
                ostr += '<span>';
            }
             
            /* jend is inclusive, but we don't print the whitespace
               for the last word within the span.  */
            var jend = mark[1];
            for (var j = mark[0]; j <= jend; ++j)
            {
                var word = words[j][0];
                var whitespace = words[j][1];
                if (word !== null)
                    ostr += word;
                if (j != jend)
                    ostr += whitespace;
            }
            ostr += '</span>';
             
	          /* Add last whitespace.  */
	          if (words[jend][1] !== null)
		            ostr += "<span>" + words[jend][1] + "</span>";
	      }
	      /* Force HTML interpretation and inclusion of all textnodes.  */
        //	var newnode = $("<span>" + ostr + "</span>");

	      var newnode = $(ostr);
	      this.target.replaceWith(newnode);
	      this.target = newnode;
    };
}
 
 
function textblock($item)
{
    this.textnodes = [];
    this.orig = $item.html();

    var textnodes = this.textnodes;
    function _extract($item)
    {
        $item.each(function() {
            /* "this" are DOM elements, type 3 is a text node.  Note:
               Some browsers may have multiple text nodes next to each
               other (32 KB maximum), but for simplicity we will break
               the token at such a boundary.  It's hard enough to get
               stable ranges under crazy dom-tree manipulations as it
               is.  As a work around, you can insert any html tag
               somewhere between two words to break it up to be under
               32KB a piece.
                
               FIXME: Do not do this for all nodes.  Ignore <pre> and
               other nodes where words aren't words and can't be
               easily wrapped in span.  */
            if (this.nodeType == 3)
            {
                textnodes.push(new textnode(this));
            }
            else
            {
                _extract($(this).contents());
            }
        });
    }
    _extract($item);
     
    /* words is an array of [word, position] where position is a
       scalar.  word may be null (indicating a leading whitespace)!  */
    this.words = [];
    var words = this.words;
     
    /* The offsets of the textnodes into the words array allow easy
       mapping back and forth.  We add the total word count at the end
       so we know the range for all textnodes, not just the start
       offset.  */
    this.textnode_offsets = [ 0 ];
    var textnode_offsets = this.textnode_offsets;
     
    var offset = 0;
    for (var i = 0, ilen = textnodes.length; i < ilen; ++i)
    {
        var node_words = textnodes[i].words;
         
        var limit = offset + node_words.length;
        textnode_offsets.push(limit);
         
        for (var j = 0, jlen = node_words.length; j < jlen; ++j)
        {
            words.push([node_words[j][0], offset + j]);
        }
        offset = limit;
    }
     
    /* Each element in markups is [start, end, classlist], where start
       and end are inclusive positions and classlist is an array of
       class names to apply.  To make the clipping a lot easier, we
       keep the list sorted and free of gaps (classlist is empty for
       an unused range).  */
    this.markups = [ [ 0, this.words.length - 1, [] ] ];
     
    this._cut_before = function(pos)
    {
        var markups = this.markups;
         
        /* Find the range that contains pos.  */
        var loc = markups.binarySearch(pos, function(markup, pos) {
            if (markup[1] < pos)
                return -1;
            else if (markup[0] > pos)
                return 1;
            else
                return 0;
        });
         
        if (loc < 0)
            /* Should never happen.  */
            return;
         
        var markup = markups[loc];
        if (pos == markup[0])
            return;
         
        var end = markup[1];
        markup[1] = pos - 1;
        markups.splice(loc + 1, 0, [pos, end, markup[2].slice()]);
    }
     
    this.apply_class = function(cssclass, startpos, endpos)
    {
        /* Mark a region for a CSS class.  */
         
        /* Cutting the existing regions at the positions we want to
           apply a class makes the following algorithm a lot easier,
           because existing regions are then either completely
           contained in the new range or completely outside.  Because
           we start with the full range, all ranges exist, so no gaps
           need to be filled.  */

        if (endpos == startpos) {
            // skip single word if stopword
            var w = this.words[endpos][0].toLowerCase();
            if (w.match(
                /\b(a|about|above|after|again|against|all|am|an|and|any|are|as|at|be|because|been|before|being|below|between|both|but|by|can|did|do|does|doing|don|down|during|each|few|for|from|further|had|has|have|having|he|her|here|hers|herself|him|himself|his|how|i|if|in|into|is|it|its|itself|just|me|more|most|my|myself|no|nor|not|now|of|off|on|once|only|or|other|our|ours|ourselves|out|over|own|s|same|she|should|so|some|such|t|than|that|the|their|theirs|them|themselves|then|there|these|they|this|those|through|to|too|under|until|up|very|was|we|were|what|when|where|which|while|who|whom|why|will|with|you|your|yours|yourself|yourselves)\b/)) {
                return;
            }
        }

        this._cut_before(startpos);
        this._cut_before(endpos + 1);
         
        /* Now we can copy the existing ranges into the new list,
           adding missing classes as we encounter them.  */
        var markups = this.markups;
        for (var i = 0, ilen = markups.length; i < ilen; ++i)
        {
            var markup = markups[i];
            var mstart = markup[0];
            var mend = markup[1];
            if (startpos <= mstart && mend <= endpos)
            {
                /* Add the cssclass if it is missing.  */
                if (markup[2].indexOf(cssclass) < 0)
                    markup[2].push(cssclass);
            }
        }
    };

    this.realize = function()
    {
        /* Render all marked changes.  */
         
        var textnodes = this.textnodes;
        var textnode_offsets = this.textnode_offsets;
        var markups = this.markups;
         
        /* This is easier to do if we first cut at all textnode
           offsets.  We never need to cut at 0 or the end, so skip the
           first and last item.  */
        for (var i = 1, ilen = textnode_offsets.length - 1; i < ilen; ++i)
        {
            this._cut_before(textnode_offsets[i]);
        }
        /* Now we group the ranges by textnodes, convert the position
           to textnode-local positions and pass them on to the
           textnode module.  */
        for (var i = 0, j = 0, ilen = textnode_offsets.length - 1, jlen = markups.length; i < ilen && j < jlen; ++i)
        {
            /* limit is the beginning of the next node, so exclusive.  */
            var offset = textnode_offsets[i];
            var limit = textnode_offsets[i + 1];
            var marks = []
            /* Doesn't matter if we use start or end position here, as we cut beforehand.  */
            while (j < jlen && markups[j][1] < limit)
            {
                var markup = markups[j];
                marks.push([markup[0] - offset, markup[1] - offset, markup[2]]);
                ++j;
            }
            /* We call this even if marks is empty, in case the
               textnode wants to do something at realization time.  */
            textnodes[i].apply_classes(marks);
        }
    };
}
 
 
/* Extract a cleaned up list.  */
function clean_list(list)
{
    var tokens = [];
    var ids = [];

    for (var i = 0, ilen = list.length; i < ilen; ++i)
    {
        var item = list[i];
        var token = item[0];
         
        if (token === null)
            continue;

        token = token.replace("ß", "ss");
        token = token.replace(/[^a-zäöüA-ZÄÖÜ0-9\u0410-\u044F\-]/g, "");

        token = token.toLowerCase();
        if (token != "")
        {
            tokens.push(token);
	          ids.push(item[1]);
	      }
    }

    return [tokens, ids];
}



$(document).ready(function() {
    $('head').append('<style type="text/css">'
        + ' .fragmark1 { background-color: #c2f598; }'
        + ' .fragmark2 { background-color: #a7c6f2; }'
        + ' .fragmark3 { background-color: #f29f9f; }'
        + ' .fragmark4 { background-color: #aff2be; }'
        + ' .fragmark5 { background-color: #e8a3ff; }'
        + ' .fragmark6 { background-color: #e6e181; }'
        + ' .fragmark7 { background-color: #b8b8ff; }'
        + ' .fragmark8 { background-color: #f5cf9f; }'
        + ' .fragmark9 { background-color: #a5e6ed; }'
        + ' .code-reference { font-size: x-small; color: gray; }'
        + '</style>');

    $('#table-tldr-examples').prevAll('h4').after(
        '<div class="code-reference">'
            + 'Text highlighting code &copy; 2012 '
            + '<a href="https://vroniplag.wikia.org/de/wiki/MediaWiki:Fragcolors/code.js">Marcusb @ VroniPlag Wiki</a>.'
            + '</div>');

    var last_selected = [];

    $('#table-tldr-examples tbody td').click(function(e) {
        var td1 = $(this);
        var td2 = $(td1.parent('tr').children()[0]);


        $(last_selected).each(function(i) {
            var x = last_selected[i];
            $(x[0]).html(x[1].orig);
        });

        if (td1.is(td2)) {
            return;
        }

        var textblocks = [new textblock(td1), new textblock(td2)];

        last_selected = [[td1, textblocks[0]], [td2, textblocks[1]]];
        var list1 = textblocks[0].words;
        list1 = clean_list(list1);
        var list2 = textblocks[1].words;
        list2 = clean_list(list2);

        var docs = [list1[0], list2[0]];
        var ids = [list1[1], list2[1]];

        function colorize(sims)
        {
            /* Colors have css classes "fragmark1" to "fragmark9" */
            var col = 0;
            var nr_col = 9;
            for (var i = 0; i < sims.length; i++)
            {
                var res = sims[i];
                 
                textblocks[res[0]].apply_class("fragmark" + (col+1), ids[res[0]][res[1]], ids[res[0]][res[1]+res[4]-1]);
                textblocks[res[2]].apply_class("fragmark" + (col+1), ids[res[2]][res[3]], ids[res[2]][res[3]+res[4]-1]);
                 
                col = (col + 1) % nr_col;
            }
            textblocks[0].realize();
            textblocks[1].realize();
        }
        var len = 1;
        var sims = cmp_text(docs, len);

        colorize(sims);
    });
});
