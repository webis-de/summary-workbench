import React, { Fragment, memo, useEffect, useRef, useState } from "react";

const innerHoverStyle = { background: "#eeee00", color: "black", display: "relative" };
const baseMarkupStyle = {
  padding: 0,
  paddingTop: "0.1em",
  paddingBottom: "0.1em",
};
const outerHoverStyle = { ...baseMarkupStyle, ...innerHoverStyle };

const initScrollState = [null, null];
const useMarkupScroll = (deps = null) => {
  const [scrollState, setScrollState] = useState(initScrollState);
  const prevDeps = useRef(deps);
  useEffect(() => {
    if (prevDeps.current !== deps) setScrollState(initScrollState);
    prevDeps.current = deps;
  }, [deps]);

  return [prevDeps.current !== deps ? initScrollState : scrollState, setScrollState];
};

const Scroll = ({ docIndex, matchOrder, groupSizes, tag, scrollState, allowScroll, children }) => {
  const [scrollMarkup, setScrollState] = scrollState;
  const scrollNext = () => {
    if (allowScroll) {
      let newScrollOrder;
      const [, scrollTag, scrollOrder] = scrollMarkup;
      if (scrollTag !== tag) newScrollOrder = Array(groupSizes.length).fill(0);
      else
        newScrollOrder = scrollOrder.map(
          (c, i) => (i === docIndex ? c : c + 1) % groupSizes[i] || 0
        );
      setScrollState([docIndex, tag, newScrollOrder]);
    }
  };
  const scrollRef = useRef();
  useEffect(() => {
    const [scrollDoc, scrollTag, scrollOrder] = scrollMarkup;
    if (
      scrollOrder &&
      docIndex !== scrollDoc &&
      tag === scrollTag &&
      matchOrder === scrollOrder[docIndex]
    ) {
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
      <span className={showMarkup ? "cursor-pointer" : ""}>
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
      </span>
    );
  return markupContent;
};

const StringContent = memo(({ content }) => {
  const lines = content.split("\n");
  return (
    <span>
      {lines[0]}
      {lines.slice(1).map((line, i) => (
        <Fragment key={i}>
          <br />
          {line}
        </Fragment>
      ))}
    </span>
  );
});

const MarkupRoot = ({ markups, markupState, scrollState, allowScroll, showMarkup }) => {
  if (typeof markups === "string") return <StringContent content={markups} />;
  return (
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
};

const Markup = ({ markups, markupState, scrollState, showMarkup = true }) => (
  <div className="leading-[22px]">
    <MarkupRoot
      markups={markups}
      markupState={markupState}
      scrollState={scrollState}
      allowScroll={showMarkup}
      showMarkup={showMarkup}
    />
  </div>
);

export { Markup, useMarkupScroll };
