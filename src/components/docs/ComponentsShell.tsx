"use client";

import type { ReactNode } from "react";
import { SiteNav } from "@/components/shell/SiteNav";
import { ThemeToggle } from "./ThemeToggle";

export function ComponentsShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNav />
      <main id="main" className="pt-16">
        {children}
      </main>
      <ThemeToggle />
    </>
  );
}
