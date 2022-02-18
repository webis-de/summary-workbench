import { Disclosure as HDisclosure } from "@headlessui/react";

const DisclosureToggle = ({ children }) => (
  <HDisclosure.Button className="w-full">{children}</HDisclosure.Button>
);

const DisclosureContent = ({ children }) => (
  <HDisclosure.Panel className="w-full">{children}</HDisclosure.Panel>
);

const Disclosure = ({ children }) => <HDisclosure>{children}</HDisclosure>;

export { Disclosure, DisclosureContent, DisclosureToggle };
