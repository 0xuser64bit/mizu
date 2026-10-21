import Link from "next/link";
import type { ReactNode } from "react";
import { SiteNav } from "@/components/shell/SiteNav";
import { ThemeToggle } from "@/components/docs/ThemeToggle";
import "./workshop.css";

const links = [
  ["/workshop", "Workshop"],
  ["/workshop/theme", "Theme"],
  ["/workshop/playground", "Playground"],
  ["/blocks", "Blocks"],
] as const;

export function WorkshopShell({
  path,
  title,
  description,
  children,
}: {
  path: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteNav trackChapters={false} />
      <main id="main" className="mizu-workshop">
        <div className="mizu-workshop-navigation">
          <nav aria-label="Workshop">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={path === href ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
        <header className="mizu-workshop-heading">
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        {children}
      </main>
    </>
  );
}
