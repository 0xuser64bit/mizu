import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_URL } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ImageResponse requires TTF, OTF or WOFF fonts.
const font = (file: string) =>
  readFile(join(process.cwd(), "src/lib/og", file));
const fonts = Promise.all([
  font("archivo-wide-900.ttf"),
  font("archivo-400.ttf"),
  font("instrument-serif-latin-400-italic.woff"),
  font("jetbrains-mono-latin-400-normal.woff"),
]);

const INK = "#0f0e0c";
const PAPER = "#f4f0e8";
const MUTED = "#a8a193";
const FAINT = "#958d7e";
const LINE = "#29241d";
const ACCENT = "#ff4d1c";

const corner = (v: "top" | "bottom", h: "left" | "right") => (
  <div
    key={v + h}
    style={{
      position: "absolute",
      [v]: 28,
      [h]: 28,
      width: 26,
      height: 26,
      [`border${v === "top" ? "Top" : "Bottom"}`]: `2px solid ${ACCENT}`,
      [`border${h === "left" ? "Left" : "Right"}`]: `2px solid ${ACCENT}`,
    }}
  />
);

export async function card({
  label,
  title,
  accent,
  line,
  path,
  foot = "npm i mizu-ui",
}: {
  label: string;
  title: string;
  accent?: string;
  line?: string;
  path: string;
  foot?: string;
}) {
  const [wide, body, serif, mono] = await fonts;
  const chars = title.length + (accent ? accent.length * 0.6 + 1 : 0);
  const fontSize = Math.max(76, Math.min(136, Math.floor(1250 / chars)));

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "68px 76px 56px",
        background: INK,
        color: PAPER,
        fontFamily: "Archivo",
      }}
    >
      {corner("top", "left")}
      {corner("top", "right")}
      {corner("bottom", "left")}
      {corner("bottom", "right")}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Archivo Wide",
            fontSize: 34,
            letterSpacing: "-0.02em",
          }}
        >
          MIZU<span style={{ color: ACCENT }}>.</span>
        </div>
        <div
          style={{
            fontFamily: "JetBrains Mono",
            fontSize: 17,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: FAINT,
          }}
        >
          {label}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            fontFamily: "Archivo Wide",
            fontSize,
            lineHeight: 0.98,
            letterSpacing: "-0.03em",
            maxWidth: 1040,
          }}
        >
          <span>{title}</span>
          {accent && (
            <span
              style={{
                marginLeft: fontSize * 0.22,
                fontFamily: "Instrument Serif",
                fontStyle: "italic",
                fontSize: fontSize * 1.08,
                letterSpacing: "-0.01em",
                color: ACCENT,
              }}
            >
              {accent}
            </span>
          )}
        </div>
        {line && (
          <div
            style={{
              display: "block",
              maxWidth: 940,
              fontSize: 32,
              lineHeight: 1.4,
              color: MUTED,
              lineClamp: 2,
            }}
          >
            {line}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 22,
          borderTop: `1px solid ${LINE}`,
          fontFamily: "JetBrains Mono",
          fontSize: 17,
          letterSpacing: "0.14em",
          color: FAINT,
        }}
      >
        <span>
          {new URL(SITE_URL).host}
          {path}
        </span>
        <span>{foot}</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Archivo Wide", data: wide, weight: 900, style: "normal" },
        { name: "Archivo", data: body, weight: 400, style: "normal" },
        { name: "Instrument Serif", data: serif, weight: 400, style: "italic" },
        { name: "JetBrains Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
