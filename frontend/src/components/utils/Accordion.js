import React from "react";

import { Badge } from "./Badge";
import { Button, DeleteButton } from "./Button";

const AccordionItem = ({
  children,
  text,
  infoText,
  buttons,
  remove,
  badges = [],
  open = false,
}) => (
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
        style={buttons || remove ? { paddingRight: "10%" } : null}
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
        {infoText && (
          <span className="uk-text-danger" style={{ margin: "0px 20px" }}>
            {infoText}
          </span>
        )}
        {badges && (
          <div className="uk-flex uk-flex-wrap" style={{ gridRowGap: "10px" }}>
            {badges.map((badge, i) => (
              <Badge key={i}>
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
        {remove && <DeleteButton onClick={remove} />}
      </div>
    </div>
    <div className="uk-padding-small uk-accordion-content" style={{ margin: 0 }}>
      {children}
    </div>
  </li>
);

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
