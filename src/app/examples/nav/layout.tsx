import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nav, isolated",
  robots: { index: false },
};

export default function NavExampleLayout({
  children,
}: LayoutProps<"/examples/nav">) {
  return children;
}
