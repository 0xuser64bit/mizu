import type { Metadata, Viewport } from "next";
import { MotionConfig } from "motion/react";
import Script from "next/script";
import "./globals.css";
import { NavigatorProvider } from "@/components/shell/Navigator";
import { Cursor } from "@/components/shell/Cursor";
import { Noise } from "@/components/shell/Noise";
import { PageWipeProvider } from "@/mizu";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site";

const gaId = process.env.NEXT_PUBLIC_GA_ID ?? "G-Q3K0S22ZXL";

const themeBootstrap = `try{var t=localStorage.getItem("mizu-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
const previewImage = {
  url: "/images/mizu-preview.png",
  width: 1734,
  height: 907,
  alt: "MIZU. An archive of interface craft, with flowing paper-colored lines converging around a vermilion diamond on warm black.",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s — Mizu" },
  description: SITE_DESCRIPTION,
  // No title or description here: a page that sets its own gets them in its
  // link previews. Setting either would put the home page's on every route.
  openGraph: {
    type: "website",
    siteName: "Mizu",
    locale: "en_US",
    images: [previewImage],
  },
  twitter: { card: "summary_large_image", images: [previewImage] },
};

export const viewport: Viewport = {
  themeColor: "#0f0e0c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="mizu-root flex min-h-full flex-col">
        <Script id="mizu-theme" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-ink"
        >
          Skip to content
        </a>
        <MotionConfig reducedMotion="user">
          <PageWipeProvider>
            <NavigatorProvider>
              {children}
              <Cursor />
            </NavigatorProvider>
          </PageWipeProvider>
        </MotionConfig>
        <Noise />
        <GoogleAnalytics gaId={gaId} />
      </body>
    </html>
  );
}
