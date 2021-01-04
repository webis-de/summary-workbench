import React from "react";

import { Badge } from "./Badge";
import { Button } from "./Button";
import { DeleteButton } from "./DeleteButton";

const AccordionItem = ({ children, text, buttons, remove, badges = [], open = false }) => {
  const badgesWithVariant =
    badges[0] instanceof Array ? badges : badges.map((badge) => [badge, true]);
  return (
    <li
      className={open ? "uk-open" : ""}
      style={{
        border: "1px",
        borderColor: "grey",
        borderStyle: "solid",
      }}
    >
      <div className="uk-flex uk-flex-middle">
        <a
          className="uk-accordion-title uk-flex uk-flex-between uk-flex-middle uk-text-small uk-width-expand uk-padding-small"
          href="/#"
          style={buttons || remove ? {paddingRight: "10%"} : null}
        >
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {text}
          </span>
          {badges && (
            <div className="uk-flex uk-flex-wrap" style={{ gridRowGap: "10px" }}>
              {badgesWithVariant.map(([badge, emphasis], i) => (
                <Badge key={i} emphasis={emphasis}>
                  {badge}
                </Badge>
              ))}
            </div>
          )}
        </a>
        <div>
          {buttons &&
            buttons.map(([buttonsText, buttonsOnClick], i) => (
              <Button
                key={i}
                variant="primary"
                size="small"
                className="uk-margin-right"
                onClick={buttonsOnClick}
              >
                {buttonsText}
              </Button>
            ))}
          {remove && <DeleteButton onClick={remove} className="uk-margin-right" />}
        </div>
      </div>
      <div className="uk-padding-small uk-accordion-content" style={{ margin: 0 }}>
        {children}
      </div>
    </li>
  );
};

const Accordion = ({ className, children }) => (
  <ul
    className={className}
    data-uk-accordion="toggle: > * > .uk-accordion-title;"
    style={{ margin: 0, flexGrow: 1 }}
  >
    {children}
  </ul>
);

export { Accordion, AccordionItem };
