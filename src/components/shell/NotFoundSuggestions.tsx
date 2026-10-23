"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Entry = {
  href: string;
  label: string;
  description: string;
  keywords?: string;
};

export function NotFoundSuggestions() {
  const term = (usePathname().split("/").pop() ?? "").toLowerCase();
  const [entries, setEntries] = useState<Entry[]>([]);
  useEffect(() => {
    if (term.length < 3) return;
    fetch("/search.json")
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => {});
  }, [term]);
  const words = term.split(/[-_.\s]+/).filter((w) => w.length > 2);
  const closest = entries
    .map((e) => ({
      e,
      score: words.filter((w) =>
        `${e.label} ${e.description} ${e.keywords ?? ""}`
          .toLowerCase()
          .includes(w),
      ).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  if (!closest.length) return null;
  return (
    <p className="mt-6 font-mono text-[11px] uppercase leading-loose tracking-[0.2em] text-faint">
      Closest in the archive:{" "}
      {closest.map(({ e }, i) => (
        <span key={e.href}>
          {i > 0 && " · "}
          <Link
            href={e.href}
            className="text-paper underline underline-offset-4"
          >
            {e.label}
          </Link>
        </span>
      ))}
    </p>
  );
}
