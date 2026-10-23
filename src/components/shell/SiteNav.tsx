"use client";

import { usePathname } from "next/navigation";
import { Nav } from "@/mizu";
import { Wordmark } from "@/components/ui/Wordmark";
import { ThemeToggle } from "@/components/docs/ThemeToggle";
import { SiteSearch } from "./SiteSearch";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/components", label: "Components" },
  { href: "/examples", label: "Examples" },
  { href: "/workshop", label: "Workshop" },
  { href: "/lab", label: "Lab" },
  { href: "/studio", label: "Standpoint" },
  { href: "/work", label: "Hire" },
];

export function SiteNav({ trackChapters = true }: { trackChapters?: boolean }) {
  const pathname = usePathname();
  return (
    <Nav
      brand={<Wordmark />}
      links={LINKS}
      actions={
        <>
          <SiteSearch />
          <ThemeToggle />
        </>
      }
      currentPath={pathname}
      trackChapters={trackChapters}
    />
  );
}
