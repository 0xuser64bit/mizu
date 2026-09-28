"use client";

import { useState, type ReactNode } from "react";
import { CopyButton } from "../feedback/CopyButton";

export function DiffView({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  className = "",
}: {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}) {
  const a = before.split("\n"),
    b = after.split("\n");
  // ponytail: aligned-line comparison, use a diff engine when moved-line matching matters.
  return (
    <div className={`mizu-diff ${className}`}>
      <section aria-label={beforeLabel}>
        <h3>{beforeLabel}</h3>
        <pre>
          {a.map((line, i) => (
            <span key={i} data-changed={line !== b[i]}>
              <span aria-hidden="true" className="mizu-diff-number">
                {i + 1}
              </span>
              {line || " "}
              {"\n"}
            </span>
          ))}
        </pre>
      </section>
      <section aria-label={afterLabel}>
        <h3>{afterLabel}</h3>
        <pre>
          {b.map((line, i) => (
            <span key={i} data-changed={line !== a[i]}>
              <span aria-hidden="true" className="mizu-diff-number">
                {i + 1}
              </span>
              {line || " "}
              {"\n"}
            </span>
          ))}
        </pre>
      </section>
    </div>
  );
}
function JsonNode({
  value,
  name,
  depth,
  ancestors,
}: {
  value: unknown;
  name: string;
  depth: number;
  ancestors: ReadonlySet<object>;
}): ReactNode {
  if (value === null || typeof value !== "object")
    return (
      <div className="mizu-json-leaf">
        <span>{name}</span>
        <code>
          {typeof value === "string" ? JSON.stringify(value) : String(value)}
        </code>
      </div>
    );
  if (ancestors.has(value))
    return <div className="mizu-json-leaf">{name}: [Circular]</div>;
  if (depth > 8)
    return <div className="mizu-json-leaf">{name}: [Depth limit]</div>;
  const next = new Set(ancestors);
  next.add(value);
  const entries = Object.entries(value);
  // ponytail: at most 200 siblings per node; paginate before inspecting large payloads.
  return (
    <details className="mizu-json-node" open={depth === 0}>
      <summary>
        {name}{" "}
        <span>
          {Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`}
        </span>
      </summary>
      <div>
        {entries.slice(0, 200).map(([key, item]) => (
          <JsonNode
            key={key}
            name={key}
            value={item}
            depth={depth + 1}
            ancestors={next}
          />
        ))}
        {entries.length > 200 && (
          <p>Showing 200 of {entries.length} entries.</p>
        )}
      </div>
    </details>
  );
}
export function DataInspector({
  value,
  label = "Data",
  className = "",
}: {
  value: unknown;
  label?: string;
  className?: string;
}) {
  let serialized = "";
  try {
    serialized = JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    /* Circular data remains inspectable; copying is unavailable. */
  }
  return (
    <section className={`mizu-data-inspector ${className}`} aria-label={label}>
      <div className="mizu-inspector-heading">
        <h3>{label}</h3>
        {serialized && (
          <CopyButton text={serialized} aria-label="Copy JSON">
            Copy JSON
          </CopyButton>
        )}
      </div>
      <JsonNode value={value} name={label} depth={0} ancestors={new Set()} />
    </section>
  );
}
export type TreeNode = {
  id: string;
  label: string;
  children?: readonly TreeNode[];
};
export function TreeView({
  nodes,
  label = "Hierarchy",
  onSelect,
  selected,
  className = "",
}: {
  nodes: readonly TreeNode[];
  label?: string;
  onSelect?: (id: string) => void;
  selected?: string;
  className?: string;
}) {
  const render = (items: readonly TreeNode[], depth = 0): ReactNode => (
    <ul>
      {items.map((node) => (
        <li key={node.id}>
          {node.children?.length ? (
            <details>
              <summary>{node.label}</summary>
              {depth < 16 ? (
                render(node.children, depth + 1)
              ) : (
                <p>Depth limit reached.</p>
              )}
            </details>
          ) : onSelect ? (
            <button
              type="button"
              aria-pressed={selected === node.id}
              onClick={() => onSelect(node.id)}
            >
              {node.label}
            </button>
          ) : (
            <span>{node.label}</span>
          )}
        </li>
      ))}
    </ul>
  );
  return (
    <nav className={`mizu-tree ${className}`} aria-label={label}>
      {render(nodes)}
    </nav>
  );
}
export type Activity = {
  id: string;
  actor: string;
  action: string;
  time: string;
  dateTime?: string;
  type?: string;
};
export function ActivityFeed({
  items,
  label = "Activity feed",
  className = "",
}: {
  items: readonly Activity[];
  label?: string;
  className?: string;
}) {
  const [filter, setFilter] = useState("All");
  const types = [
    ...new Set(items.map((i) => i.type).filter((t): t is string => !!t)),
  ];
  const shown = items.filter((i) => filter === "All" || i.type === filter);
  return (
    <section className={`mizu-activity-feed ${className}`} aria-label={label}>
      <div className="mizu-activity-heading">
        <h3>{label}</h3>
        {types.length > 0 && (
          <select
            className="mizu-input"
            aria-label={`Filter ${label.toLowerCase()}`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        )}
      </div>
      <ol>
        {shown.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.actor}</strong> {item.action}
            </div>
            <time dateTime={item.dateTime}>{item.time}</time>
          </li>
        ))}
      </ol>
      {!shown.length && (
        <p className="mizu-field-hint">No activity in this view.</p>
      )}
    </section>
  );
}
