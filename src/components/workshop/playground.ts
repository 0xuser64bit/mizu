export type PlaygroundPiece =
  "button" | "badge" | "text-field" | "alert" | "slider";
export type PlaygroundConfig = {
  text: string;
  detail: string;
  variant: "solid" | "ghost" | "inverse";
  tone: "neutral" | "success" | "warning" | "error";
  badgeTone: "paper" | "muted" | "accent" | "line";
  size: "md" | "sm";
  disabled: boolean;
  loading: boolean;
  arrow: boolean;
  diamond: boolean;
  required: boolean;
  error: boolean;
  amount: number;
  inputValue: string;
};
export const PLAYGROUND_PIECES = [
  { value: "button", label: "Button" },
  { value: "badge", label: "Badge" },
  { value: "text-field", label: "TextField" },
  { value: "alert", label: "Alert" },
  { value: "slider", label: "Slider" },
] as const;

export function defaultConfig(piece: PlaygroundPiece): PlaygroundConfig {
  return {
    text: {
      button: "Keep the good work",
      badge: "Ready for review",
      "text-field": "Project name",
      alert: "Your changes are saved",
      slider: "Playback speed",
    }[piece],
    detail: {
      button: "",
      badge: "",
      "text-field": "A name your team can find.",
      alert: "You can return to this draft whenever you need it.",
      slider: "",
    }[piece],
    variant: "solid",
    tone: "success",
    badgeTone: "accent",
    size: "md",
    disabled: false,
    loading: false,
    arrow: true,
    diamond: true,
    required: false,
    error: false,
    amount: 50,
    inputValue: "",
  };
}

export function playgroundCode(
  piece: PlaygroundPiece,
  config: PlaygroundConfig,
) {
  const q = JSON.stringify;
  const name = PLAYGROUND_PIECES.find((item) => item.value === piece)!.label;
  const interactive =
    piece === "button" || piece === "text-field" || piece === "slider";
  const state =
    piece === "button"
      ? "  const [clicks, setClicks] = useState(0);\n"
      : piece === "text-field"
        ? `  const [value, setValue] = useState(${q(config.inputValue)});\n`
        : piece === "slider"
          ? `  const [value, setValue] = useState(${config.amount});\n`
          : "";
  const attributes =
    piece === "button"
      ? `variant=${q(config.variant)} size=${q(config.size)}${config.disabled ? " disabled" : ""}${config.loading ? " loading" : ""}${!config.arrow ? " arrow={false}" : ""} onClick={() => setClicks(clicks + 1)}`
      : piece === "badge"
        ? `tone=${q(config.badgeTone)}${!config.diamond ? " diamond={false}" : ""}`
        : piece === "text-field"
          ? `label={${q(config.text)}} hint={${q(config.detail)}} value={value} onChange={(event) => setValue(event.target.value)}${config.disabled ? " disabled" : ""}${config.required ? " required" : ""}${config.error ? ' error="Enter a project name."' : ""}`
          : piece === "alert"
            ? `title={${q(config.text)}} tone=${q(config.tone)}`
            : `label={${q(config.text)}} min={0} max={100} step={1} value={value} onChange={setValue}${config.disabled ? " disabled" : ""}`;
  const element =
    piece === "text-field" || piece === "slider"
      ? `<${name} ${attributes} />`
      : `<${name} ${attributes}>{${q(piece === "alert" ? config.detail : config.text)}}</${name}>`;
  const body =
    piece === "button"
      ? `    <>\n      ${element}\n      <p role="status">Clicked {clicks} times.</p>\n    </>`
      : `    ${element}`;
  return `${interactive ? '"use client";\n\nimport { useState } from "react";\n' : ""}import { ${name} } from "mizu-ui";\n\nexport function Example() {\n${state}  return (\n${body}\n  );\n}\n`;
}
