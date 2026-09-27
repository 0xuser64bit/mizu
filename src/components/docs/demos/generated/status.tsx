"use client";
// Generated from catalog usage by bun run examples:sync.
import { useState } from "react";
import {
  Status,
  Alert,
  Progress,
  Meter,
  Skeleton,
  EmptyState,
  Button,
  ErrorState,
  ConnectionStatus,
  SaveIndicator,
  AsyncBoundary,
  TaskProgress,
  AsyncButton,
} from "@/mizu";

export function StatusDemo() {
  return <Status tone="success">Ready to publish</Status>;
}

export function AlertDemo() {
  return (
    <Alert title="Your draft is safe" tone="success">
      Saved locally. Publish when you are ready.
    </Alert>
  );
}

export function ProgressDemo() {
  const [value, setValue] = useState(42);
  return (
    <>
      <Progress label="Processing artwork" value={value} />
      <input
        type="range"
        aria-label="Demo progress"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
    </>
  );
}

export function MeterDemo() {
  return (
    <Meter
      label="Storage used"
      value={68}
      low={30}
      high={85}
      optimum={20}
      format={(v) => `${v} GB of 100 GB`}
    />
  );
}

export function SkeletonDemo() {
  return <Skeleton lines={4} label="Loading release notes" />;
}

export function EmptyStateDemo() {
  const [created, setCreated] = useState(false);
  return created ? (
    <p>Your new draft is ready.</p>
  ) : (
    <EmptyState
      title="No releases yet"
      action={
        <Button size="sm" onClick={() => setCreated(true)}>
          Create a release
        </Button>
      }
    >
      Your first release starts with a finished piece.
    </EmptyState>
  );
}

export function ErrorStateDemo() {
  const [retried, setRetried] = useState(false);
  return retried ? (
    <p>Retry requested.</p>
  ) : (
    <ErrorState title="Could not load artwork" onRetry={() => setRetried(true)}>
      Check your connection and try again.
    </ErrorState>
  );
}

export function ConnectionStatusDemo() {
  return <ConnectionStatus />;
}

export function SaveIndicatorDemo() {
  const [state, setState] = useState<"saved" | "unsaved" | "saving" | "error">(
    "unsaved",
  );
  return (
    <>
      <SaveIndicator state={state} onRetry={() => setState("saving")} />
      <select
        aria-label="Demo save state"
        value={state}
        onChange={(e) => setState(e.target.value as typeof state)}
      >
        {["saved", "unsaved", "saving", "error"].map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
    </>
  );
}

export function AsyncBoundaryDemo() {
  const [state, setState] = useState<"ready" | "loading" | "empty" | "error">(
    "ready",
  );
  return (
    <>
      <select
        aria-label="Demo content state"
        value={state}
        onChange={(e) => setState(e.target.value as typeof state)}
      >
        {["ready", "loading", "empty", "error"].map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
      <AsyncBoundary state={state} onRetry={() => setState("ready")}>
        <p>The archive is ready.</p>
      </AsyncBoundary>
    </>
  );
}

export function TaskProgressDemo() {
  const [cancelled, setCancelled] = useState(false);
  return (
    <TaskProgress
      label="Prepare release"
      onCancel={() => setCancelled(true)}
      steps={[
        { id: "a", label: "Validate", state: "complete" },
        {
          id: "b",
          label: "Build",
          state: cancelled ? "error" : "running",
          detail: cancelled ? "Cancelled by you" : "Compiling package",
        },
        { id: "c", label: "Publish", state: "queued" },
      ]}
    />
  );
}

export function AsyncButtonDemo() {
  return (
    <AsyncButton
      action={() => navigator.clipboard.writeText("Mizu")}
      successLabel="Copied"
    >
      Copy Mizu
    </AsyncButton>
  );
}
