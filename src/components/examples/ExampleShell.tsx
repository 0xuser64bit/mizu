import Link from "next/link";
import type { ReactNode } from "react";
import { SiteNav } from "@/components/shell/SiteNav";

/** The frame every composed example shares: navigation, a numbered title and a lede. */
export function ExampleShell({
  number,
  title,
  lede,
  systems,
  children,
}: {
  number: string;
  title: string;
  lede: ReactNode;
  /** The signature systems composed on the page. */
  systems: readonly string[];
  children: ReactNode;
}) {
  return (
    <>
      <SiteNav trackChapters={false} />
      <main id="main" className="mizu-example">
        <header className="mizu-example-head">
          <p className="mizu-example-kicker">
            <Link href="/examples">Examples</Link> <span>/</span> EX—{number}
          </p>
          <h1>{title}</h1>
          <div className="mizu-example-lede">{lede}</div>
          <ul className="mizu-example-systems" aria-label="Composed from">
            {systems.map((s) => (
              <li key={s}>
                <Link
                  href={`/components/${s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}`}
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </header>
        {children}
      </main>
    </>
  );
}
