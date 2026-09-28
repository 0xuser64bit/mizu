"use client";

import { useId, useRef, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "../motion/Preferences";
import { EASE_EXPO } from "../motion/easings";
import { SegmentedControl } from "../forms/Selection";
import { MultiSelect } from "../interaction/MultiSelect";
import { useAnnouncer, useControllable } from "./internal";
import {
  OPERATORS,
  describeQuery,
  isComplete,
  isGroup,
  operatorOf,
  type QueryField,
  type QueryGroup,
  type QueryRule,
  type QueryValue,
} from "./query";

export type { QueryField, QueryGroup, QueryRule, QueryValue } from "./query";
export { describeQuery, matchesQuery } from "./query";

type Node = QueryRule | QueryGroup;
const makeId = () => `q${Math.random().toString(36).slice(2, 9)}`;

function update(
  group: QueryGroup,
  id: string,
  change: (node: Node) => Node | null,
): QueryGroup {
  return {
    ...group,
    rules: group.rules.flatMap((node) => {
      if (node.id === id) {
        const next = change(node);
        return next ? [next] : [];
      }
      return isGroup(node) ? [update(node, id, change)] : [node];
    }),
  };
}

/**
 * Conditions that read as a sentence: typed operators per field, nested
 * groups, a plain-language summary and an evaluator for local filtering.
 */
export function QueryBuilder({
  label,
  fields,
  value,
  defaultValue,
  onValueChange,
  maxDepth = 3,
  createId = makeId,
  footer,
  className = "",
  style,
}: {
  label: string;
  fields: readonly QueryField[];
  value?: QueryGroup;
  defaultValue?: QueryGroup;
  onValueChange?: (value: QueryGroup) => void;
  /** Nesting limit for groups; 1 allows no subgroups. */
  maxDepth?: number;
  createId?: () => string;
  /** Beside the summary, e.g. a live count of matches. */
  footer?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const [query, setQuery] = useControllable<QueryGroup>(
    value,
    defaultValue ?? { id: "root", combinator: "and", rules: [] },
    onValueChange,
  );
  const [message, announce] = useAnnouncer();
  const focusRef = useRef<string | null>(null);
  const change = (id: string, fn: (node: Node) => Node | null) =>
    setQuery(
      id === query.id ? (fn(query) as QueryGroup) : update(query, id, fn),
    );
  const newRule = (): QueryRule => {
    const field = fields[0]!;
    return {
      id: createId(),
      field: field.id,
      operator: OPERATORS[field.type][0]!.id,
    };
  };
  const add = (groupId: string, node: Node) => {
    focusRef.current = isGroup(node) ? (node.rules[0]?.id ?? null) : node.id;
    change(groupId, (g) => ({
      ...(g as QueryGroup),
      rules: [...(g as QueryGroup).rules, node],
    }));
    announce(isGroup(node) ? "Group added." : "Condition added.");
  };
  const summary = describeQuery(query, fields);

  return (
    <section
      className={`mizu-query ${className}`}
      style={style}
      aria-label={label}
    >
      <Group
        group={query}
        depth={1}
        maxDepth={maxDepth}
        fields={fields}
        onChange={change}
        onAdd={add}
        newRule={newRule}
        createId={createId}
        focusRef={focusRef}
        announce={announce}
      />
      <footer className="mizu-query-summary">
        <p>
          <span>Reads as</span>
          {summary}
        </p>
        {footer && <div className="mizu-query-footer">{footer}</div>}
      </footer>
      <span className="mizu-sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </section>
  );
}

type GroupProps = {
  group: QueryGroup;
  depth: number;
  maxDepth: number;
  fields: readonly QueryField[];
  onChange: (id: string, fn: (node: Node) => Node | null) => void;
  onAdd: (groupId: string, node: Node) => void;
  newRule: () => QueryRule;
  createId: () => string;
  focusRef: React.RefObject<string | null>;
  announce: (message: string) => void;
  onRemove?: () => void;
};

function Group({
  group,
  depth,
  maxDepth,
  fields,
  onChange,
  onAdd,
  newRule,
  createId,
  focusRef,
  announce,
  onRemove,
}: GroupProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const transition = reduce
    ? { duration: 0 }
    : { duration: 0.3, ease: EASE_EXPO };
  const word = group.combinator === "and" ? "and" : "or";
  return (
    <fieldset
      className="mizu-query-group"
      data-depth={depth}
      aria-labelledby={`${id}-legend`}
    >
      <legend id={`${id}-legend`} className="mizu-sr-only">
        {depth === 1 ? "Conditions" : "Group"}: match{" "}
        {group.combinator === "and" ? "all" : "any"}
      </legend>
      <div className="mizu-query-head">
        <span aria-hidden="true">Match</span>
        <SegmentedControl
          label={`Match all or any ${depth === 1 ? "conditions" : "conditions in this group"}`}
          value={group.combinator}
          onValueChange={(v) => {
            onChange(group.id, (g) => ({
              ...(g as QueryGroup),
              combinator: v as "and" | "or",
            }));
            announce(
              v === "and"
                ? "Every condition must match."
                : "Any condition may match.",
            );
          }}
          options={[
            { value: "and", label: "All" },
            { value: "or", label: "Any" },
          ]}
        />
        <span aria-hidden="true">of the following</span>
        {onRemove && (
          <button
            type="button"
            className="mizu-query-remove-group"
            onClick={onRemove}
          >
            Remove group
          </button>
        )}
      </div>
      <ol className="mizu-query-rules">
        <AnimatePresence initial={false}>
          {group.rules.map((node, i) => (
            <motion.li
              key={node.id}
              layout="position"
              initial={reduce ? false : { opacity: 0, height: 0, x: -8 }}
              animate={{ opacity: 1, height: "auto", x: 0 }}
              exit={
                reduce
                  ? { opacity: 0, transition: { duration: 0 } }
                  : { opacity: 0, height: 0 }
              }
              transition={transition}
              className="mizu-query-item"
            >
              {i > 0 && (
                <span className="mizu-query-join" aria-hidden="true">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={word}
                      initial={reduce ? false : { y: "100%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      exit={{ y: "-100%", opacity: 0 }}
                      transition={transition}
                    >
                      {word}
                    </motion.span>
                  </AnimatePresence>
                </span>
              )}
              {isGroup(node) ? (
                <Group
                  group={node}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  fields={fields}
                  onChange={onChange}
                  onAdd={onAdd}
                  newRule={newRule}
                  createId={createId}
                  focusRef={focusRef}
                  announce={announce}
                  onRemove={() => {
                    onChange(node.id, () => null);
                    announce("Group removed.");
                  }}
                />
              ) : (
                <Rule
                  rule={node}
                  index={i + 1}
                  fields={fields}
                  focusRef={focusRef}
                  onChange={(next) => onChange(node.id, () => next)}
                  onRemove={() => {
                    onChange(node.id, () => null);
                    announce("Condition removed.");
                  }}
                />
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
      {!group.rules.length && (
        <p className="mizu-query-empty">No conditions — everything matches.</p>
      )}
      <div className="mizu-query-actions">
        <button
          type="button"
          onClick={() => onAdd(group.id, newRule())}
          disabled={!fields.length}
        >
          + Condition
        </button>
        {depth < maxDepth && (
          <button
            type="button"
            onClick={() =>
              onAdd(group.id, {
                id: createId(),
                combinator: group.combinator === "and" ? "or" : "and",
                rules: [newRule()],
              })
            }
            disabled={!fields.length}
          >
            + Group
          </button>
        )}
      </div>
    </fieldset>
  );
}

function Rule({
  rule,
  index,
  fields,
  focusRef,
  onChange,
  onRemove,
}: {
  rule: QueryRule;
  index: number;
  fields: readonly QueryField[];
  focusRef: React.RefObject<string | null>;
  onChange: (rule: QueryRule) => void;
  onRemove: () => void;
}) {
  const id = useId();
  const field = fields.find((f) => f.id === rule.field) ?? fields[0]!;
  const op = operatorOf(field, rule.operator) ?? OPERATORS[field.type][0]!;
  const complete = isComplete(rule, fields);
  const set = (value: QueryValue) => onChange({ ...rule, value });
  const name = `condition ${index}`;
  const numeric = (v: string) => (v === "" ? undefined : Number(v));
  const options = field.options ?? [];

  let input: ReactNode = null;
  if (op.arity === 2) {
    const pair = (Array.isArray(rule.value) ? rule.value : []) as number[];
    input = (
      <span className="mizu-query-pair">
        <input
          className="mizu-input"
          type="number"
          aria-label={`Lower value for ${name}`}
          value={Number.isFinite(pair[0]) ? pair[0] : ""}
          onChange={(e) =>
            set([numeric(e.target.value) ?? NaN, pair[1] ?? NaN] as [
              number,
              number,
            ])
          }
        />
        <span aria-hidden="true">and</span>
        <input
          className="mizu-input"
          type="number"
          aria-label={`Upper value for ${name}`}
          value={Number.isFinite(pair[1]) ? pair[1] : ""}
          onChange={(e) =>
            set([pair[0] ?? NaN, numeric(e.target.value) ?? NaN] as [
              number,
              number,
            ])
          }
        />
        {field.unit && <span className="mizu-query-unit">{field.unit}</span>}
      </span>
    );
  } else if (op.arity === "many") {
    const chosen = (Array.isArray(rule.value) ? rule.value : []) as string[];
    input =
      options.length <= 8 ? (
        <span
          className="mizu-query-chips"
          role="group"
          aria-label={`Values for ${name}`}
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              aria-pressed={chosen.includes(o.value)}
              onClick={() =>
                set(
                  chosen.includes(o.value)
                    ? chosen.filter((c) => c !== o.value)
                    : [...chosen, o.value],
                )
              }
            >
              {o.label}
            </button>
          ))}
        </span>
      ) : (
        <MultiSelect
          label={field.label}
          value={chosen}
          onValueChange={set}
          options={options}
        />
      );
  } else if (op.arity === 1) {
    const text =
      typeof rule.value === "string"
        ? rule.value
        : typeof rule.value === "number" && Number.isFinite(rule.value)
          ? String(rule.value)
          : "";
    input =
      field.type === "select" ? (
        <select
          className="mizu-input"
          aria-label={`Value for ${name}`}
          value={text}
          onChange={(e) => set(e.target.value || undefined)}
        >
          <option value="">Choose…</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.type === "date" && op.id !== "last" ? (
        <input
          className="mizu-input"
          type="date"
          aria-label={`Value for ${name}`}
          value={text}
          onChange={(e) => set(e.target.value || undefined)}
        />
      ) : field.type === "number" || op.id === "last" ? (
        <span className="mizu-query-pair">
          <input
            className="mizu-input"
            type="number"
            aria-label={`Value for ${name}`}
            value={text}
            onChange={(e) => set(numeric(e.target.value))}
          />
          {(field.unit || op.id === "last") && (
            <span className="mizu-query-unit">
              {op.id === "last" ? "days" : field.unit}
            </span>
          )}
        </span>
      ) : (
        <input
          className="mizu-input"
          type="text"
          aria-label={`Value for ${name}`}
          placeholder="Value"
          value={text}
          onChange={(e) => set(e.target.value)}
        />
      );
  }

  return (
    <div
      className="mizu-query-rule"
      role="group"
      aria-label={`Condition ${index}`}
      aria-describedby={!complete ? `${id}-needs` : undefined}
      data-incomplete={!complete || undefined}
      ref={(el) => {
        if (el && focusRef.current === rule.id) {
          focusRef.current = null;
          el.querySelector("select")?.focus();
        }
      }}
    >
      <select
        className="mizu-input"
        aria-label={`Field for ${name}`}
        value={field.id}
        onChange={(e) => {
          const next = fields.find((f) => f.id === e.target.value)!;
          onChange({
            id: rule.id,
            field: next.id,
            operator: OPERATORS[next.type][0]!.id,
          });
        }}
      >
        {fields.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>
      <select
        className="mizu-input"
        aria-label={`Comparison for ${name}`}
        value={op.id}
        onChange={(e) => {
          const next = operatorOf(field, e.target.value)!;
          onChange({
            ...rule,
            operator: next.id,
            value: next.arity === op.arity ? rule.value : undefined,
          });
        }}
      >
        {OPERATORS[field.type].map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      {input}
      <button
        type="button"
        className="mizu-query-remove"
        aria-label={`Remove ${name}`}
        onClick={onRemove}
      >
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M3 3l6 6M9 3l-6 6" />
        </svg>
      </button>
      {!complete && (
        <span id={`${id}-needs`} className="mizu-query-needs">
          Needs a value — ignored until complete
        </span>
      )}
    </div>
  );
}
