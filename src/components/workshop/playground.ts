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
  const attr = (key: string, value: string) =>
    /["&\p{Cc}]/u.test(value) ? `${key}={${q(value)}}` : `${key}="${value}"`;
  const text = (value: string) =>
    value.trim() !== value || /[{}<>&\p{Cc}]/u.test(value)
      ? `{${q(value)}}`
      : value;
  const attributes = (
    piece === "button"
      ? [
          config.variant !== "solid" && `variant="${config.variant}"`,
          config.size !== "md" && `size="${config.size}"`,
          config.disabled && "disabled",
          config.loading && "loading",
          !config.arrow && "arrow={false}",
          "onClick={() => setClicks(clicks + 1)}",
        ]
      : piece === "badge"
        ? [
            config.badgeTone !== "muted" && `tone="${config.badgeTone}"`,
            !config.diamond && "diamond={false}",
          ]
        : piece === "text-field"
          ? [
              attr("label", config.text),
              config.detail && attr("hint", config.detail),
              "value={value}",
              "onChange={(event) => setValue(event.target.value)}",
              config.disabled && "disabled",
              config.required && "required",
              config.error && 'error="Enter a project name."',
            ]
          : piece === "alert"
            ? [
                attr("title", config.text),
                config.tone !== "neutral" && `tone="${config.tone}"`,
              ]
            : [
                attr("label", config.text),
                "min={0}",
                "max={100}",
                "value={value}",
                "onChange={setValue}",
                config.disabled && "disabled",
              ]
  )
    .filter(Boolean)
    .map((attribute) => ` ${attribute}`)
    .join("");
  const children = piece === "alert" ? config.detail : config.text;
  const element =
    piece === "text-field" ||
    piece === "slider" ||
    (piece === "alert" && !children)
      ? `<${name}${attributes} />`
      : `<${name}${attributes}>${text(children)}</${name}>`;
  const body =
    piece === "button"
      ? `    <>\n      ${element}\n      <p role="status">Clicked {clicks} times.</p>\n    </>`
      : `    ${element}`;
  return `${interactive ? '"use client";\n\nimport { useState } from "react";\n' : ""}import { ${name} } from "mizu-ui";\n\nexport function Example() {\n${state}  return (\n${body}\n  );\n}\n`;
}
