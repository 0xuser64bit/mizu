import type { ReactNode } from "react";
import { ComponentsShell } from "@/components/docs/ComponentsShell";

export default function ComponentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ComponentsShell>{children}</ComponentsShell>;
}
