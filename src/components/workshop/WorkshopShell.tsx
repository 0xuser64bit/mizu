import Link from "next/link";
import type { ReactNode } from "react";
import { SiteNav } from "@/components/shell/SiteNav";
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
  aside,
  children,
}: {
  path: string;
  title: string;
  description: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <SiteNav trackChapters={false} />
      <main id="main" className="mizu-example mizu-workshop">
        <header className="mizu-example-head">
          <div className="mizu-workshop-navigation">
            <nav aria-label="Workshop" className="mizu-example-kicker">
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
          </div>
          <h1>{title}</h1>
          <div className="mizu-example-lede">
            <p>{description}</p>
          </div>
          {aside}
        </header>
        {children}
      </main>
    </>
  );
}
