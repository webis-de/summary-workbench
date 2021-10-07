import React, { Fragment, memo, useCallback, useEffect, useRef, useState } from "react";

const innerHoverStyle = { background: "yellow", color: "black", display: "relative" };
const baseMarkupStyle = {
  padding: 0,
  paddingTop: "0.1em",
  paddingBottom: "0.1em"
};
const outerHoverStyle = { ...baseMarkupStyle, ...innerHoverStyle };

const initScrollState = [null, null, null];
const useMarkupScroll = () => {
  const [scrollState, setScrollState] = useState(initScrollState);
  const resetScrollState = useCallback(() => setScrollState(initScrollState), [setScrollState]);
  return [scrollState, setScrollState, resetScrollState];
};

const Scroll = ({ docIndex, matchOrder, groupSizes, tag, scrollState, allowScroll, children }) => {
  const [scrollMarkup, setScrollMarkup] = scrollState;
  const [scrollDoc, scrollTag, scrollOrder] = scrollMarkup;
  const scrollNext = () => {
    if (allowScroll) {
      if (scrollTag === tag && scrollDoc === 1 - docIndex)
        setScrollMarkup([scrollDoc, scrollTag, (scrollOrder + 1) % groupSizes[scrollDoc]]);
      else setScrollMarkup([1 - docIndex, tag, 0]);
    }
  };
  const scrollRef = useRef();
  useEffect(() => {
    if (docIndex === scrollMarkup[0] && tag === scrollMarkup[1] && matchOrder === scrollMarkup[2]) {
      scrollRef.current.scrollIntoView({ block: "nearest", behavior: "smooth", inline: "start" });
    }
  }, [tag, scrollMarkup, docIndex, matchOrder]);
  return (
    <span ref={scrollRef} onClick={scrollNext}>
      {children}
    </span>
  );
};

const TaggedMarkup = ({ markup, markupState, scrollState, allowScroll, showMarkup }) => {
  let props = {};
  let style = {};
  const [content, information] = markup;
  const [tag, bgcolor, fgcolor, docIndex, matchOrder, groupSizes] = information;
  if (showMarkup) style = { ...baseMarkupStyle, background: bgcolor, color: fgcolor };
  if (markupState) {
    const [currMarkup, setCurrMarkup] = markupState;
    if (tag === currMarkup) style = showMarkup ? outerHoverStyle : innerHoverStyle;
    const onMouseEnter = showMarkup ? () => setCurrMarkup(tag) : null;
    const onMouseLeave = showMarkup ? () => setCurrMarkup(null) : null;
    props = { onMouseEnter, onMouseLeave };
  }
  const markupContent = (
    <span {...props} style={style}>
      <MarkupRoot
        markups={content}
        markupState={markupState}
        scrollState={scrollState}
        showMarkup={false}
      />
    </span>
  );
  if (scrollState)
    return (
      <Scroll
        tag={tag}
        docIndex={docIndex}
        matchOrder={matchOrder}
        groupSizes={groupSizes}
        markup={content}
        scrollState={scrollState}
        allowScroll={allowScroll}
      >
        {markupContent}
      </Scroll>
    );
  return markupContent;
};

const StringContent = memo(({ content }) => {
  const lines = content.split("\n");
  return (
    <span>
      <>{lines[0]}</>
      {lines.slice(1).map((line, i) => (
        <Fragment key={i}>
          <br />
          {line}
        </Fragment>
      ))}
    </span>
  );
});

const MarkupRoot = ({ markups, markupState, scrollState, allowScroll, showMarkup }) => (
  <>
    {markups.map((child, i) => {
      if (typeof child === "string") return <StringContent key={i} content={child} />;
      return (
        <TaggedMarkup
          key={i}
          markup={child}
          markupState={markupState}
          scrollState={scrollState}
          allowScroll={allowScroll}
          showMarkup={showMarkup}
        />
      );
    })}
  </>
);

const Markup = ({ markups, markupState, scrollState, showMarkup = true }) => (
  <>
    <MarkupRoot
      markups={markups}
      markupState={markupState}
      scrollState={scrollState}
      allowScroll={showMarkup}
      showMarkup={showMarkup}
    />
  </>
);

export { Markup, useMarkupScroll };
