"use client";

import { useState, type CSSProperties } from "react";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  CodeBlock,
  ColorPicker,
  CopyButton,
  Progress,
  SegmentedControl,
  SelectField,
  Slider,
  Stat,
  Status,
  Switch,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTrigger,
  TextField,
} from "@/mizu";
import {
  THEME_PRESETS,
  themeChecks,
  themeCSS,
  themeTokens,
  type ThemeRecipe,
} from "./theme";

function ThemePreview({ view }: { view: string }) {
  const [checked, setChecked] = useState([true, true, false]);
  const [name, setName] = useState("Field notes");
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  if (view === "components")
    return (
      <div className="mizu-theme-samples">
        <div>
          <Stat
            label="Ready for review"
            value="24"
            detail="Illustrative workspace data"
          />
          <div className="mizu-workbench-actions">
            <Badge tone="accent">Selected</Badge>
            <Badge>Draft</Badge>
          </div>
          <Progress label="Upload progress" value={72} />
          <Alert title="Changes are local" tone="neutral">
            This preview sends no data.
          </Alert>
        </div>
        <div>
          <TextField
            label="Workspace name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
          />
          <Switch
            label="Email notifications"
            checked={notifications}
            onChange={(e) => {
              setNotifications(e.target.checked);
              setSaved(false);
            }}
          />
          <Button arrow={false} onClick={() => setSaved(true)}>
            Save preferences
          </Button>
          <Status tone={saved ? "success" : "neutral"} role="status">
            {saved ? "Preferences saved for this preview" : "Try the controls"}
          </Status>
        </div>
      </div>
    );

  return (
    <>
      <div className="mizu-theme-title-row">
        <Badge tone="accent">Workspace</Badge>
        <span>Illustrative project · October 21</span>
      </div>
      <h2>A place for good work.</h2>
      <p className="mizu-theme-description">
        A quiet surface for the details that matter. Every control here uses the
        theme you are making.
      </p>
      <Tabs defaultValue="review">
        <TabsList label="Preview workspace">
          <TabsTrigger value="review">Review queue</TabsTrigger>
          <TabsTrigger value="settings">Preferences</TabsTrigger>
        </TabsList>
        <TabsPanel value="review">
          <div className="mizu-theme-tasks">
            {[
              "Set the visual direction",
              "Finish every keyboard path",
              "Release when it is ready",
            ].map((label, i) => (
              <Checkbox
                key={label}
                label={label}
                checked={checked[i]}
                onChange={(e) =>
                  setChecked(
                    checked.map((value, at) =>
                      at === i ? e.target.checked : value,
                    ),
                  )
                }
              />
            ))}
          </div>
          <Progress
            label="Review complete"
            value={checked.filter(Boolean).length}
            max={3}
          />
        </TabsPanel>
        <TabsPanel value="settings">
          <div className="mizu-theme-tasks">
            <TextField
              label="Workspace name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
            />
            <Switch
              label="Email notifications"
              checked={notifications}
              onChange={(e) => {
                setNotifications(e.target.checked);
                setSaved(false);
              }}
            />
            <Button arrow={false} onClick={() => setSaved(true)}>
              Save preferences
            </Button>
            <p role="status" className="mizu-field-hint">
              {saved
                ? "Preferences saved for this preview."
                : "Changes stay in this preview."}
            </p>
          </div>
        </TabsPanel>
      </Tabs>
    </>
  );
}

export function ThemeWorkshop() {
  const [recipe, setRecipe] = useState<ThemeRecipe>({ ...THEME_PRESETS.Ink });
  const [preset, setPreset] = useState("Ink");
  const [view, setView] = useState("workspace");
  const checks = themeChecks(recipe);
  const css = themeCSS(recipe);
  const update = <K extends keyof ThemeRecipe>(
    key: K,
    value: ThemeRecipe[K],
  ) => {
    setRecipe({ ...recipe, [key]: value });
    setPreset("Custom");
  };

  return (
    <>
      <div className="mizu-workbench">
        <div className="mizu-workbench-controls">
          <h2>Make it yours</h2>
          <SelectField
            label="Starting palette"
            value={preset}
            onChange={(e) => {
              const name = e.target.value as keyof typeof THEME_PRESETS;
              if (name in THEME_PRESETS) {
                setRecipe({ ...THEME_PRESETS[name] });
                setPreset(name);
              }
            }}
          >
            {Object.keys(THEME_PRESETS).map((name) => (
              <option key={name}>{name}</option>
            ))}
            {preset === "Custom" && <option>Custom</option>}
          </SelectField>
          <ColorPicker
            label="Surface"
            value={recipe.surface}
            swatches={[]}
            onValueChange={(value) => update("surface", value)}
          />
          <ColorPicker
            label="Text"
            value={recipe.paper}
            swatches={[]}
            onValueChange={(value) => update("paper", value)}
          />
          <ColorPicker
            label="Signal"
            value={recipe.accent}
            swatches={[]}
            onValueChange={(value) => update("accent", value)}
          />
          <ColorPicker
            label="Action fill"
            value={recipe.fill}
            swatches={[]}
            onValueChange={(value) => update("fill", value)}
          />
          <SelectField
            label="Color scheme"
            value={recipe.scheme}
            onChange={(e) =>
              update("scheme", e.target.value as ThemeRecipe["scheme"])
            }
            hint="Sets browser controls and status colors."
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </SelectField>
          <SelectField
            label="Typeface"
            value={recipe.font}
            onChange={(e) =>
              update("font", e.target.value as ThemeRecipe["font"])
            }
          >
            <option value="archivo">Archivo</option>
            <option value="system">System sans</option>
            <option value="mono">JetBrains Mono</option>
          </SelectField>
          <Slider
            label="Corners"
            min={0}
            max={12}
            value={recipe.radius}
            onChange={(value) => update("radius", value)}
            format={(value) => `${value}px`}
          />
          <button
            type="button"
            className="mizu-workshop-reset"
            onClick={() => {
              setRecipe({ ...THEME_PRESETS.Ink });
              setPreset("Ink");
            }}
          >
            Reset to Mizu ink
          </button>
        </div>
        <div className="mizu-workbench-result">
          <div className="mizu-workbench-toolbar">
            <SegmentedControl
              label="Theme preview"
              value={view}
              onValueChange={setView}
              options={[
                { value: "workspace", label: "Workspace" },
                { value: "components", label: "Components" },
              ]}
            />
            <p>Live preview · {preset}</p>
          </div>
          <section
            aria-label="Custom theme preview"
            data-theme={recipe.scheme}
            style={themeTokens(recipe) as CSSProperties}
            className="mizu-theme-preview mizu-root"
          >
            <ThemePreview view={view} />
          </section>
          <section
            className="mizu-theme-checks"
            aria-label="Theme contrast checks"
          >
            <h2>Check the contrast</h2>
            <dl>
              {checks.map(({ label, ratio }) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd data-pass={ratio >= 4.5}>
                    {ratio.toFixed(2)}:1{" "}
                    <span>{ratio >= 4.5 ? "Pass" : "Adjust"}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p>
              {checks.every(({ ratio }) => ratio >= 4.5)
                ? "All five checks meet 4.5:1 for normal text."
                : "Adjust the colors marked above before using this theme."}{" "}
              Text checks use the lowest ratio across the three generated
              surfaces. These are color checks, not a full accessibility audit.
            </p>
          </section>
        </div>
      </div>
      <section className="mizu-workshop-export" aria-label="Export theme">
        <div className="mizu-workshop-export-heading">
          <h2>Your theme, ready to take</h2>
          <div className="mizu-workbench-actions">
            <CopyButton text={css} aria-label="Copy theme CSS">
              Copy CSS
            </CopyButton>
            <a
              className="mizu-btn mizu-btn--ghost mizu-btn--sm"
              download="mizu-theme.css"
              href={`data:text/css;charset=utf-8,${encodeURIComponent(css)}`}
            >
              Download CSS
            </a>
          </div>
        </div>
        <CodeBlock filename="mizu-theme.css" language="css" code={css} />
        <p className="mizu-workshop-note">
          Import this after Mizu’s stylesheet. It applies one palette to all
          theme ancestors; use a specific <code>{'[data-theme="light"]'}</code> or{" "}
          <code>{'[data-theme="dark"]'}</code> selector to keep separate variants.
          Fonts use Mizu’s optional font stylesheet or your existing font
          variables.
        </p>
      </section>
    </>
  );
}
