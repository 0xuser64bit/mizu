import type { Metadata, Viewport } from "next";
import { MotionConfig } from "motion/react";
import "./globals.css";
import { NavigatorProvider } from "@/components/shell/Navigator";
import { Cursor } from "@/components/shell/Cursor";
import { Thread } from "@/components/shell/Thread";
import { Noise } from "@/components/shell/Noise";

export const metadata: Metadata = {
  title: "Mizu — An Archive of Interface Craft",
  description:
    "Mizu is a living archive of interface craft: surfaces, motion, typography and systems, made slowly.",
  openGraph: {
    title: "Mizu — An Archive of Interface Craft",
    description:
      "Mizu is a living archive of interface craft: surfaces, motion, typography and systems, made slowly.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0e0c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
        precedence="default"
      />
      <body className="flex min-h-full flex-col bg-ink font-display text-paper">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-ink"
        >
          Skip to content
        </a>
        <MotionConfig reducedMotion="user">
          <NavigatorProvider>
            <Thread />
            {children}
            <Cursor />
          </NavigatorProvider>
        </MotionConfig>
        <Noise />
      </body>
    </html>
  );
}
