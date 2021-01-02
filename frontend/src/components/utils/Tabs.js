import React from "react";

const TabHead = ({ tabs }) => (
  <ul className="uk-tab" data-uk-tab="connect: + .uk-switcher;">
    {tabs.map((tab) => (
      <li key={tab}>
        <a href="/#">{tab}</a>
      </li>
    ))}
  </ul>
);

const TabContent = ({ children }) => <ul className="uk-switcher">{children}</ul>;

const TabItem = ({ children }) => <li>{children}</li>;

export { TabHead, TabContent, TabItem };
