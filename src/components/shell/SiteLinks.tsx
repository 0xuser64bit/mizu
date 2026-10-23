"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LinkProvider } from "@/mizu";

export function SiteLinks({ children }: { children: ReactNode }) {
  return <LinkProvider component={Link}>{children}</LinkProvider>;
}
