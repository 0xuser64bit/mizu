"use client";

import "./workshop.css";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  CodeBlock,
  SegmentedControl,
  SelectField,
  Slider,
  TextField,
} from "@/mizu";
import {
  defaultConfig,
  playgroundCode,
  PLAYGROUND_PIECES,
  type PlaygroundConfig,
  type PlaygroundPiece,
} from "./playground";

function Playground({ piece }: { piece: PlaygroundPiece }) {
  const [config, setConfig] = useState(() => defaultConfig(piece));
  const [clicks, setClicks] = useState(0);
  const [value, setValue] = useState("");
  const [amount, setAmount] = useState(config.amount);
  const [readout, setReadout] = useState(
    piece === "badge" || piece === "alert"
      ? "Change a prop. The preview and code follow."
      : "Try the component. Its actions appear here.",
  );
  const [theme, setTheme] = useState("inherit");
  const [narrow, setNarrow] = useState(false);
  const update = <K extends keyof PlaygroundConfig>(
    key: K,
    next: PlaygroundConfig[K],
  ) => setConfig({ ...config, [key]: next });
  const code = playgroundCode(piece, { ...config, amount, inputValue: value });
  const reset = () => {
    const next = defaultConfig(piece);
    setConfig(next);
    setClicks(0);
    setValue("");
    setAmount(next.amount);
    setReadout("Preview reset.");
  };
  const preview =
    piece === "button" ? (
      <Button
        variant={config.variant}
        size={config.size}
        disabled={config.disabled}
        loading={config.loading}
        arrow={config.arrow}
        onClick={() => {
          setClicks(clicks + 1);
          setReadout(`Clicked ${clicks + 1} times.`);
        }}
      >
        {config.text}
      </Button>
    ) : piece === "badge" ? (
      <Badge tone={config.badgeTone} diamond={config.diamond}>
        {config.text}
      </Badge>
    ) : piece === "text-field" ? (
      <TextField
        label={config.text}
        hint={config.detail}
        value={value}
        disabled={config.disabled}
        required={config.required}
        error={config.error ? "Enter a project name." : undefined}
        onChange={(e) => {
          setValue(e.target.value);
          setReadout(`Value: ${e.target.value || "empty"}`);
        }}
      />
    ) : piece === "alert" ? (
      <Alert title={config.text} tone={config.tone}>
        {config.detail}
      </Alert>
    ) : (
      <Slider
        label={config.text}
        value={amount}
        min={0}
        max={100}
        onChange={(next) => {
          setAmount(next);
          setReadout(`Value: ${next}`);
        }}
        disabled={config.disabled}
      />
    );
  return (
    <div className="mizu-workbench">
      <div className="mizu-workbench-controls">
        <h2>Props</h2>
        <TextField
          label={
            piece === "alert"
              ? "Title"
              : piece === "text-field" || piece === "slider"
                ? "Label"
                : "Text"
          }
          value={config.text}
          onChange={(e) => update("text", e.target.value)}
          maxLength={120}
        />
        {(piece === "text-field" || piece === "alert") && (
          <TextField
            label={piece === "alert" ? "Description" : "Hint"}
            value={config.detail}
            onChange={(e) => update("detail", e.target.value)}
            maxLength={240}
          />
        )}
        {piece === "button" && (
          <>
            <SelectField
              label="Variant"
              value={config.variant}
              onChange={(e) =>
                update("variant", e.target.value as PlaygroundConfig["variant"])
              }
            >
              {["solid", "ghost", "inverse"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </SelectField>
            <SelectField
              label="Size"
              value={config.size}
              onChange={(e) =>
                update("size", e.target.value as PlaygroundConfig["size"])
              }
            >
              <option value="md">Medium</option>
              <option value="sm">Small</option>
            </SelectField>
            <Checkbox
              label="Loading"
              checked={config.loading}
              onChange={(e) => update("loading", e.target.checked)}
            />
            <Checkbox
              label="Directional arrow"
              checked={config.arrow}
              onChange={(e) => update("arrow", e.target.checked)}
            />
          </>
        )}
        {piece === "badge" && (
          <>
            <SelectField
              label="Badge tone"
              value={config.badgeTone}
              onChange={(e) =>
                update(
                  "badgeTone",
                  e.target.value as PlaygroundConfig["badgeTone"],
                )
              }
            >
              {["paper", "muted", "accent", "line"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </SelectField>
            <Checkbox
              label="Diamond marker"
              checked={config.diamond}
              onChange={(e) => update("diamond", e.target.checked)}
            />
          </>
        )}
        {piece === "alert" && (
          <SelectField
            label="Alert tone"
            value={config.tone}
            onChange={(e) =>
              update("tone", e.target.value as PlaygroundConfig["tone"])
            }
          >
            {["neutral", "success", "warning", "error"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectField>
        )}
        {piece === "text-field" && (
          <>
            <Checkbox
              label="Required"
              checked={config.required}
              onChange={(e) => update("required", e.target.checked)}
            />
            <Checkbox
              label="Show error"
              checked={config.error}
              onChange={(e) => update("error", e.target.checked)}
            />
          </>
        )}
        {piece === "slider" && (
          <Slider
            label="Initial value"
            value={amount}
            min={0}
            max={100}
            onChange={setAmount}
          />
        )}
        {(piece === "button" ||
          piece === "text-field" ||
          piece === "slider") && (
          <Checkbox
            label="Disabled"
            checked={config.disabled}
            onChange={(e) => update("disabled", e.target.checked)}
          />
        )}
        <button type="button" className="mizu-workshop-reset" onClick={reset}>
          Reset props and preview
        </button>
      </div>
      <div className="mizu-workbench-result">
        <div className="mizu-workbench-toolbar">
          <SelectField
            label="Preview theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="inherit">Page theme</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </SelectField>
          <button
            className="mizu-workshop-reset"
            type="button"
            aria-pressed={narrow}
            onClick={() => setNarrow(!narrow)}
          >
            {narrow ? "Full width" : "Narrow preview"}
          </button>
        </div>
        <section
          aria-label="Component preview"
          data-theme={theme === "inherit" ? undefined : theme}
          className="mizu-playground-stage mizu-root"
        >
          <div
            data-piece={piece}
            style={{ maxWidth: narrow ? 280 : undefined }}
          >
            {preview}
          </div>
        </section>
        <p className="mizu-playground-readout" role="status">
          {readout}
        </p>
        <section
          className="mizu-playground-source"
          aria-label="Generated React code"
        >
          <h2>What you see, in React</h2>
          <CodeBlock filename="Example.tsx" language="tsx" code={code} />
        </section>
      </div>
    </div>
  );
}

export function PropsPlayground({
  initialPiece = "button",
  inline = false,
}: {
  initialPiece?: PlaygroundPiece;
  inline?: boolean;
}) {
  const [piece, setPiece] = useState<PlaygroundPiece>(initialPiece);
  if (inline) return <Playground piece={piece} />;
  return (
    <>
      <div className="mizu-playground-picker">
        <SegmentedControl
          label="Component"
          value={piece}
          onValueChange={(next) => setPiece(next as PlaygroundPiece)}
          options={PLAYGROUND_PIECES}
        />
      </div>
      <Playground key={piece} piece={piece} />
      <p className="mizu-workshop-note">
        Import <code>mizu-ui/styles.css</code> once in your application. These
        snippets include their state and imports; preview theme and width are
        inspection tools. Open a component’s documentation for its full API.
      </p>
    </>
  );
}
