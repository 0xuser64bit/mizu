"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "../button";
import { SelectField } from "../select-field";
import { Status } from "../status";
import { Switch } from "../switch";
import { TextField } from "../text-field";
import "./blocks.css";

type Settings = {
  name: string;
  email: string;
  visibility: "private" | "team" | "public";
  summaries: boolean;
};
const defaults: Settings = {
  name: "Harbour studio",
  email: "studio@example.com",
  visibility: "team",
  summaries: true,
};
const storageKey = "mizu-settings-block-v1";
const changeEvent = "mizu-settings-block-change";
function subscribe(callback: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) callback();
  };
  window.addEventListener("storage", storage);
  window.addEventListener(changeEvent, callback);
  return () => {
    window.removeEventListener("storage", storage);
    window.removeEventListener(changeEvent, callback);
  };
}
function snapshot() {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return "unavailable";
  }
}
function parseSettings(raw: string | null): Settings | null {
  if (!raw) return null;
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object")
    throw new Error("Invalid settings");
  const value = parsed as Partial<Settings>;
  if (
    typeof value.name !== "string" ||
    !value.name.trim() ||
    value.name.length > 60 ||
    typeof value.email !== "string" ||
    value.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email) ||
    !["private", "team", "public"].includes(value.visibility ?? "") ||
    typeof value.summaries !== "boolean"
  )
    throw new Error("Invalid settings");
  return {
    name: value.name,
    email: value.email,
    visibility: value.visibility as Settings["visibility"],
    summaries: value.summaries,
  };
}

export function SettingsBlock() {
  const stored = useSyncExternalStore(subscribe, snapshot, () => null);
  const [draft, setDraft] = useState<Settings | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  let saved: Settings | null = null;
  let restoreError = "";
  try {
    saved = parseSettings(stored);
  } catch {
    restoreError =
      "Saved settings could not be read. Your draft is safe; save again to replace the local copy.";
  }
  const current = draft ?? saved ?? defaults;
  const dirty = JSON.stringify(current) !== JSON.stringify(saved ?? defaults);
  function edit(next: Partial<Settings>) {
    setDraft({ ...current, ...next });
    setError("");
    setNotice("");
  }

  return (
    <section
      className="mizu-block mizu-block-settings"
      aria-label="Workspace settings"
    >
      <div className="mizu-block-settings-intro">
        <h3>{current.name || "Your workspace"}</h3>
        <p>Give the workspace a name and decide how it meets the world.</p>
        <Status
          tone={
            error ? "error" : dirty ? "warning" : saved ? "success" : "neutral"
          }
        >
          {error
            ? "Save failed"
            : dirty
              ? "Unsaved changes"
              : saved
                ? "Saved on this device"
                : "No local save yet"}
        </Status>
        <p className="mizu-field-hint">
          This sample stores settings only in this browser. The contact address
          receives no messages.
        </p>
      </div>
      <form
        className="mizu-block-settings-form"
        onSubmit={(event) => {
          event.preventDefault();
          const next = {
            ...current,
            name: current.name.trim(),
            email: current.email.trim(),
          };
          if (!next.name) {
            setError("Enter a workspace name before saving.");
            return;
          }
          try {
            localStorage.setItem(storageKey, JSON.stringify(next));
            window.dispatchEvent(new Event(changeEvent));
            setDraft(null);
            setError("");
            setNotice("Settings saved on this device.");
          } catch {
            setError(
              "This browser could not save your settings. Keep this page open and try saving again.",
            );
          }
        }}
        onReset={() => {
          setDraft(null);
          setError("");
          setNotice("Draft discarded. Your saved settings are unchanged.");
        }}
      >
        <TextField
          label="Workspace name"
          name="workspaceName"
          value={current.name}
          onChange={(event) => edit({ name: event.target.value })}
          required
          maxLength={60}
          autoComplete="organization"
        />
        <TextField
          label="Contact email"
          name="contactEmail"
          value={current.email}
          onChange={(event) => edit({ email: event.target.value })}
          type="email"
          required
          maxLength={254}
          autoComplete="email"
        />
        <SelectField
          label="Workspace visibility"
          name="visibility"
          value={current.visibility}
          onChange={(event) =>
            edit({ visibility: event.target.value as Settings["visibility"] })
          }
        >
          <option value="private">Private — only you</option>
          <option value="team">Team — invited people</option>
          <option value="public">Public — anyone with the link</option>
        </SelectField>
        <Switch
          label="Weekly summary preference"
          name="summaries"
          checked={current.summaries}
          onChange={(event) => edit({ summaries: event.target.checked })}
        />
        <div className="mizu-block-actions">
          <Button type="submit" arrow={false}>
            Save settings
          </Button>
          <Button type="reset" variant="ghost" arrow={false} disabled={!draft}>
            Discard changes
          </Button>
          <button
            type="button"
            className="mizu-block-text-action"
            onClick={() => {
              setDraft({ ...defaults });
              setError("");
              setNotice("Defaults restored to the draft. Save to keep them.");
            }}
          >
            Restore defaults
          </button>
        </div>
        {(error || restoreError) && (
          <p className="mizu-field-error" role="alert">
            {error || restoreError}
          </p>
        )}
        <p className="mizu-field-hint" role="status">
          {notice}
        </p>
      </form>
    </section>
  );
}
