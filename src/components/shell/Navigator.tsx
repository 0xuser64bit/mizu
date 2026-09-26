"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_WIPE } from "@/lib/motion";

const TITLES: Record<string, string> = {
  "/": "Mizu — An Archive of Interface Craft",
  "/lab": "The Lab — Mizu",
  "/studio": "The Standpoint — Mizu",
};

type NavContextValue = { navigate: (href: string, label: string) => void };
const NavContext = createContext<NavContextValue>({ navigate: () => {} });

export const useNavigator = () => useContext(NavContext);

export function NavigatorProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [wipe, setWipe] = useState<{ label: string; id: number } | null>(null);
  const busy = useRef(false);

  const navigate = useCallback(
    (href: string, label: string) => {
      if (busy.current) return;
      if (reduce || href === pathname) {
        router.push(href);
        return;
      }
      busy.current = true;
      setWipe({ label, id: Date.now() });
      window.setTimeout(() => {
        router.push(href);
        window.scrollTo({ top: 0, behavior: "instant" });
        document.title = TITLES[href] ?? TITLES["/"];
      }, 500);
      window.setTimeout(() => {
        setWipe(null);
        busy.current = false;
      }, 1080);
    },
    [reduce, pathname, router]
  );

  return (
    <NavContext.Provider value={{ navigate }}>
      {children}
      <AnimatePresence>
        {wipe && (
          <motion.div
            key={wipe.id}
            className="pointer-events-none fixed inset-0 z-[90] border-r-2 border-accent bg-ink-2"
            initial={{ x: "-101%" }}
            animate={{ x: "101%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.05, ease: EASE_WIPE }}
          >
            <div className="flex h-full items-center justify-center">
              <motion.span
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: [0, 1, 1, 0], y: 0 }}
                transition={{ duration: 1.05, times: [0, 0.22, 0.72, 1], ease: "linear" }}
                className="font-mono text-xs uppercase tracking-[0.45em] text-paper/70"
              >
                {wipe.label}
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </NavContext.Provider>
  );
}

export function NavigatorLink({
  href,
  label,
  className,
  children,
  onClick,
}: {
  href: string;
  label: string;
  className?: string;
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { navigate } = useNavigator();
  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) return;
        e.preventDefault();
        navigate(href, label);
      }}
      className={className}
    >
      {children}
    </Link>
  );
}
