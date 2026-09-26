"use client";

import { createContext, useCallback, useContext, useRef, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePageWipe } from "@/mizu";

const TITLES: Record<string, string> = {
  "/": "Mizu — An Archive of Interface Craft",
  "/lab": "The Lab — Mizu",
  "/studio": "The Standpoint — Mizu",
  "/components": "The Components — Mizu",
};

type NavContextValue = { navigate: (href: string, label: string) => void };
const NavContext = createContext<NavContextValue>({ navigate: () => {} });

export const useNavigator = () => useContext(NavContext);

export function NavigatorProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { wipe } = usePageWipe();
  const busy = useRef(false);

  const navigate = useCallback(
    (href: string, label: string) => {
      if (busy.current) return;
      if (href === pathname) return;
      busy.current = true;
      void wipe(label).then(() => {
        router.push(href);
        window.scrollTo({ top: 0, behavior: "instant" });
        if (TITLES[href]) document.title = TITLES[href];
        window.setTimeout(() => {
          busy.current = false;
        }, 600);
      });
    },
    [pathname, router, wipe]
  );

  return (
    <NavContext.Provider value={{ navigate }}>{children}</NavContext.Provider>
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
