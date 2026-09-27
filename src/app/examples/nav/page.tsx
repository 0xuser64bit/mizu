"use client";
import { useState } from "react";
import { Nav } from "@/mizu";
export default function NavExample() {
  const [light, setLight] = useState(false);
  return (
    <div
      className="mizu-root"
      data-theme={light ? "light" : "dark"}
      style={{
        background: "var(--mizu-ink)",
        color: "var(--mizu-paper)",
        minHeight: "100vh",
      }}
    >
      <Nav
        brand={<strong>MIZU.</strong>}
        links={[
          { href: "#first", label: "Overview" },
          { href: "#second", label: "Details" },
        ]}
        currentPath="#first"
      />
      <main style={{ padding: "100px 24px 48px" }}>
        <section
          id="first"
          data-chapter="Overview"
          style={{ minHeight: 380, scrollMarginTop: 90 }}
        >
          <h1 style={{ fontSize: 40 }}>A working thread.</h1>
          <p style={{ color: "var(--mizu-muted)", lineHeight: 1.8 }}>
            Scroll this frame. Open the menu at a narrow width. Follow a
            destination and use Escape to return.
          </p>
        </section>
        <section
          id="second"
          data-chapter="Details"
          style={{ minHeight: 380, scrollMarginTop: 90 }}
        >
          <h2 style={{ fontSize: 32 }}>Keep your place.</h2>
          <p style={{ color: "var(--mizu-muted)", lineHeight: 1.8 }}>
            The progress line follows this document, and the chapter label
            follows the section in view.
          </p>
        </section>
      </main>
      <button
        className="mizu-text-button"
        style={{ position: "fixed", bottom: 16, right: 24, zIndex: 90 }}
        onClick={() => setLight(!light)}
      >
        Use {light ? "dark" : "light"} theme
      </button>
    </div>
  );
}
