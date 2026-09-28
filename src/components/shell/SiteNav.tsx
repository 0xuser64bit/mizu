"use client";

import { usePathname } from "next/navigation";
import { Nav } from "@/mizu";
import { Wordmark } from "@/components/ui/Wordmark";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/components", label: "Components" },
  { href: "/examples", label: "Examples" },
  { href: "/lab", label: "Lab" },
  { href: "/studio", label: "Standpoint" },
];

export function SiteNav({ trackChapters = true }: { trackChapters?: boolean }) {
  const pathname = usePathname();
  return (
    <Nav
      brand={<Wordmark />}
      links={LINKS}
      currentPath={pathname}
      trackChapters={trackChapters}
    />
  );
}
