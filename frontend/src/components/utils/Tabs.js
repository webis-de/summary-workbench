import React from "react";

const TabHead = ({ tabs, setActiveTab }) => (
  <ul className="uk-tab" data-uk-tab="connect: + .uk-switcher;">
    {tabs.map((tab, i) => (
      <li key={tab}>
        <a href="/#" onClick={() => setActiveTab && setActiveTab(i)}>
          {tab}
        </a>
      </li>
    ))}
  </ul>
);

const TabContent = ({ children }) => <ul className="uk-switcher">{children}</ul>;

const TabItem = ({ children }) => <li>{children}</li>;

export { TabHead, TabContent, TabItem };
