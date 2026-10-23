"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { CommandPalette } from "@/mizu";

type Entry = {
  href: string;
  label: string;
  description: string;
  keywords?: string;
};

const PAGES: Entry[] = [
  { href: "/", label: "Home", description: "The archive" },
  { href: "/components", label: "Components", description: "Every system, by family" },
  { href: "/components/getting-started", label: "Getting started", description: "Install, fonts, themes and tokens" },
  { href: "/examples", label: "Examples", description: "Systems working together" },
  { href: "/examples/incident-review", label: "Incident review", description: "Example · Chronicle, TrendChart, LogStream" },
  { href: "/examples/design-review", label: "Design review", description: "Example · TriageDeck, Annotator, Board" },
  { href: "/examples/automation", label: "Automation builder", description: "Example · FlowGraph, QueryBuilder" },
  { href: "/examples/audio-workbench", label: "Audio workbench", description: "Example · Waveform, Outliner" },
  { href: "/workshop", label: "Workshop", description: "Theme builder, playground and blocks" },
  { href: "/workshop/theme", label: "Theme workshop", description: "Workshop · Live tokens and CSS export" },
  { href: "/workshop/playground", label: "Props playground", description: "Workshop · Edit props, copy JSX" },
  { href: "/blocks", label: "Blocks", description: "Installable compositions" },
  { href: "/lab", label: "Lab", description: "Instruments and experiments" },
  { href: "/studio", label: "Standpoint", description: "What Mizu is, and is not" },
  { href: "/work", label: "Hire", description: "Commissions, rates and a brief" },
];

const never = () => () => {};

export function SiteSearch() {
  const router = useRouter();
  const apple = useSyncExternalStore(
    never,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => true,
  );
  const [open, setOpen] = useState(false);
  const [systems, setSystems] = useState<Entry[]>([]);
  const loading = useRef(false);

  const load = useCallback(() => {
    if (loading.current) return;
    loading.current = true;
    fetch("/search.json")
      .then((r) => r.json())
      .then(setSystems)
      .catch(() => {
        loading.current = false;
      });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        load();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [load]);

  const commands = useMemo(
    () =>
      [...PAGES, ...systems].map((e) => ({
        id: e.href,
        label: e.label,
        description: e.description,
        keywords: e.keywords,
        onSelect: () => router.push(e.href),
      })),
    [systems, router],
  );

  return (
    <>
      <button
        type="button"
        className="mizu-site-search"
        aria-keyshortcuts="Meta+K Control+K"
        onPointerEnter={load}
        onFocus={load}
        onClick={() => {
          load();
          setOpen(true);
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M9.5 9.5 13 13" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        <span className="mizu-sr-only">Search</span>
        <kbd aria-hidden>{apple ? "⌘K" : "Ctrl K"}</kbd>
      </button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={commands}
        label="Search Mizu"
        placeholder="Find a component or a page…"
      />
    </>
  );
}
