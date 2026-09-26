"use client";

import type { ReactNode } from "react";
import { Nav } from "@/mizu";
import { Wordmark } from "@/components/ui/Wordmark";
import { ThemeToggle } from "./ThemeToggle";

export function ComponentsShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav
        brand={<Wordmark />}
        links={[
          { href: "/", label: "Home" },
          { href: "/components", label: "Components" },
          { href: "/lab", label: "Lab" },
          { href: "/studio", label: "Standpoint" },
        ]}
      />
      <main id="main" className="pt-16">
        {children}
      </main>
      <ThemeToggle />
    </>
  );
}
