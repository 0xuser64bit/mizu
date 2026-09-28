"use client";

import {
  useSyncExternalStore,
  type HTMLAttributes,
  type ReactNode,
  type CSSProperties,
} from "react";

export type StatusTone = "neutral" | "success" | "warning" | "error";
export function Status({
  children,
  tone = "neutral",
  className = "",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: StatusTone }) {
  return (
    <span className={`mizu-status ${className}`} data-tone={tone} {...props}>
      <span className="mizu-status-node" aria-hidden="true" />
      {children}
    </span>
  );
}
export function Alert({
  title,
  children,
  tone = "neutral",
  action,
  className = "",
  ...props
}: Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title: string;
  tone?: StatusTone;
  action?: ReactNode;
}) {
  return (
    <div
      className={`mizu-alert ${className}`}
      data-tone={tone}
      role={tone === "error" ? "alert" : "status"}
      {...props}
    >
      <Status tone={tone}>{title}</Status>
      {children && <div className="mizu-alert-body">{children}</div>}
      {action && <div className="mizu-alert-action">{action}</div>}
    </div>
  );
}
export function Progress({
  value,
  max = 100,
  label = "Progress",
  showValue = true,
  className = "",
}: {
  value?: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}) {
  const limit = Math.max(1, max),
    current =
      value === undefined ? undefined : Math.min(limit, Math.max(0, value));
  return (
    <div className={`mizu-progress ${className}`}>
      <div className="mizu-progress-heading">
        <span>{label}</span>
        {showValue && (
          <span>
            {current === undefined
              ? "In progress"
              : `${Math.round((current / limit) * 100)}%`}
          </span>
        )}
      </div>
      <progress aria-label={label} max={limit} value={current} />
    </div>
  );
}
export function Meter({
  value,
  min = 0,
  max = 100,
  low,
  high,
  optimum,
  label,
  format,
  className = "",
}: {
  value: number;
  min?: number;
  max?: number;
  low?: number;
  high?: number;
  optimum?: number;
  label: string;
  format?: (value: number) => string;
  className?: string;
}) {
  const limit = Math.max(min + 1, max),
    current = Math.min(limit, Math.max(min, value));
  return (
    <div className={`mizu-meter ${className}`}>
      <div className="mizu-progress-heading">
        <span>{label}</span>
        <span>{format ? format(current) : current}</span>
      </div>
      <meter
        aria-label={label}
        min={min}
        max={limit}
        low={low}
        high={high}
        optimum={optimum}
        value={current}
      />
    </div>
  );
}
export function Skeleton({
  lines = 3,
  label = "Loading content",
  className = "",
  style,
}: {
  lines?: number;
  label?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`mizu-skeleton ${className}`}
      role="status"
      aria-label={label}
      style={style}
    >
      {Array.from({ length: Math.min(20, Math.max(1, lines)) }, (_, i) => (
        <span aria-hidden="true" key={i} />
      ))}
    </div>
  );
}
export function EmptyState({
  title,
  children,
  action,
  icon,
  className = "",
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mizu-empty ${className}`}>
      {icon && (
        <div aria-hidden="true" className="mizu-empty-icon">
          {icon}
        </div>
      )}
      <h3>{title}</h3>
      {children && <div className="mizu-empty-body">{children}</div>}
      {action && <div className="mizu-empty-action">{action}</div>}
    </div>
  );
}
export function ErrorState({
  title = "Something went wrong",
  children,
  onRetry,
  className = "",
}: {
  title?: string;
  children?: ReactNode;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`mizu-error-state ${className}`} role="alert">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {onRetry && (
        <button type="button" className="mizu-text-button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
const subscribeConnection = (callback: () => void) => {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
};
export function ConnectionStatus({
  onlineLabel = "Connected",
  offlineLabel = "Offline — changes may not sync",
  className = "",
}: {
  onlineLabel?: string;
  offlineLabel?: string;
  className?: string;
}) {
  const online = useSyncExternalStore(
    subscribeConnection,
    () => navigator.onLine,
    () => true,
  );
  return (
    <Status
      className={className}
      role="status"
      tone={online ? "success" : "warning"}
    >
      {online ? onlineLabel : offlineLabel}
    </Status>
  );
}
export function SaveIndicator({
  state,
  onRetry,
  className = "",
}: {
  state: "saved" | "unsaved" | "saving" | "error";
  onRetry?: () => void;
  className?: string;
}) {
  const messages = {
    saved: "All changes saved",
    unsaved: "Unsaved changes",
    saving: "Saving changes…",
    error: "Changes could not be saved",
  };
  return (
    <div className={`mizu-save-indicator ${className}`}>
      <Status
        role="status"
        tone={
          state === "error"
            ? "error"
            : state === "saved"
              ? "success"
              : "neutral"
        }
      >
        {messages[state]}
      </Status>
      {state === "error" && onRetry && (
        <button type="button" className="mizu-text-button" onClick={onRetry}>
          Retry save
        </button>
      )}
    </div>
  );
}
export function AsyncBoundary({
  state,
  children,
  loading,
  empty,
  error,
  onRetry,
}: {
  state: "loading" | "empty" | "error" | "ready";
  children: ReactNode;
  loading?: ReactNode;
  empty?: ReactNode;
  error?: string;
  onRetry?: () => void;
}) {
  if (state === "loading") return <>{loading ?? <Skeleton />}</>;
  if (state === "empty")
    return <>{empty ?? <EmptyState title="Nothing here yet" />}</>;
  if (state === "error")
    return (
      <ErrorState onRetry={onRetry}>
        {error ?? "The content could not be loaded."}
      </ErrorState>
    );
  return <>{children}</>;
}
export type TaskStep = {
  id: string;
  label: string;
  state: "queued" | "running" | "complete" | "error";
  detail?: string;
};
export function TaskProgress({
  steps,
  label = "Task progress",
  onCancel,
  className = "",
}: {
  steps: readonly TaskStep[];
  label?: string;
  onCancel?: () => void;
  className?: string;
}) {
  const done = steps.filter((s) => s.state === "complete").length;
  return (
    <section className={`mizu-task-progress ${className}`} aria-label={label}>
      <Progress label={label} value={done} max={Math.max(1, steps.length)} />
      <ol>
        {steps.map((step) => (
          <li key={step.id} data-state={step.state}>
            <Status
              tone={
                step.state === "complete"
                  ? "success"
                  : step.state === "error"
                    ? "error"
                    : "neutral"
              }
            >
              {step.label}
            </Status>
            <span className="mizu-task-state">{step.state}</span>
            {step.detail && <small>{step.detail}</small>}
          </li>
        ))}
      </ol>
      {onCancel && steps.some((s) => s.state === "running") && (
        <button type="button" className="mizu-text-button" onClick={onCancel}>
          Cancel task
        </button>
      )}
    </section>
  );
}
