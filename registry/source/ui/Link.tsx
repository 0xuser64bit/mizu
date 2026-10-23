"use client";

import {
  createContext,
  createElement,
  useContext,
  type AnchorHTMLAttributes,
  type ComponentType,
  type ReactNode,
} from "react";

export type LinkComponent = ComponentType<
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>;

const LinkContext = createContext<LinkComponent | "a">("a");

export function LinkProvider({
  component,
  children,
}: {
  component: LinkComponent;
  children: ReactNode;
}) {
  return (
    <LinkContext.Provider value={component}>{children}</LinkContext.Provider>
  );
}

export function Anchor(
  props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string },
) {
  return createElement(useContext(LinkContext), props);
}
