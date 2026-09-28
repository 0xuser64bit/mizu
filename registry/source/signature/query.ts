export type QueryFieldType = "text" | "number" | "date" | "select" | "boolean";
export type QueryField = {
  id: string;
  label: string;
  type: QueryFieldType;
  /** Choices for select fields. */
  options?: readonly { value: string; label: string }[];
  /** Shown after numeric values, e.g. "GB". */
  unit?: string;
};
export type QueryValue =
  | string
  | number
  | boolean
  | readonly string[]
  | readonly [number, number]
  | undefined;
export type QueryRule = {
  id: string;
  field: string;
  operator: string;
  value?: QueryValue;
};
export type QueryGroup = {
  id: string;
  combinator: "and" | "or";
  rules: readonly (QueryRule | QueryGroup)[];
};

export const isGroup = (node: QueryRule | QueryGroup): node is QueryGroup =>
  "rules" in node;

type Operator = { id: string; label: string; arity: 0 | 1 | 2 | "many" };
export const OPERATORS: Record<QueryFieldType, Operator[]> = {
  text: [
    { id: "contains", label: "contains", arity: 1 },
    { id: "not_contains", label: "does not contain", arity: 1 },
    { id: "is", label: "is", arity: 1 },
    { id: "is_not", label: "is not", arity: 1 },
    { id: "starts", label: "starts with", arity: 1 },
    { id: "empty", label: "is empty", arity: 0 },
    { id: "not_empty", label: "is not empty", arity: 0 },
  ],
  number: [
    { id: "eq", label: "=", arity: 1 },
    { id: "ne", label: "≠", arity: 1 },
    { id: "gt", label: ">", arity: 1 },
    { id: "gte", label: "≥", arity: 1 },
    { id: "lt", label: "<", arity: 1 },
    { id: "lte", label: "≤", arity: 1 },
    { id: "between", label: "is between", arity: 2 },
  ],
  date: [
    { id: "on", label: "is on", arity: 1 },
    { id: "before", label: "is before", arity: 1 },
    { id: "after", label: "is after", arity: 1 },
    { id: "last", label: "is in the last", arity: 1 },
  ],
  select: [
    { id: "is", label: "is", arity: 1 },
    { id: "is_not", label: "is not", arity: 1 },
    { id: "any", label: "is any of", arity: "many" },
    { id: "none", label: "is none of", arity: "many" },
  ],
  boolean: [
    { id: "true", label: "is yes", arity: 0 },
    { id: "false", label: "is no", arity: 0 },
  ],
};

export const operatorOf = (field: QueryField | undefined, id: string) =>
  field ? OPERATORS[field.type].find((o) => o.id === id) : undefined;

/** A rule is complete when its operator exists and it has every value that operator needs. */
export function isComplete(rule: QueryRule, fields: readonly QueryField[]) {
  const field = fields.find((f) => f.id === rule.field);
  const op = operatorOf(field, rule.operator);
  if (!op) return false;
  const v = rule.value;
  if (op.arity === 0) return true;
  if (op.arity === 2)
    return (
      Array.isArray(v) && v.length === 2 && v.every((n) => Number.isFinite(n))
    );
  if (op.arity === "many") return Array.isArray(v) && v.length > 0;
  if (field!.type === "number" || (field!.type === "date" && op.id === "last"))
    return typeof v === "number" && Number.isFinite(v);
  return typeof v === "string" && v.trim() !== "";
}

const DAY = 864e5;
const day = (value: unknown) => {
  const t =
    value instanceof Date
      ? value.getTime()
      : typeof value === "string" || typeof value === "number"
        ? new Date(value).getTime()
        : NaN;
  return Number.isFinite(t) ? Math.floor(t / DAY) : NaN;
};

/**
 * Whether a record satisfies the query. Incomplete rules are ignored, so a
 * half-written condition never empties a result list. `now` fixes "in the last".
 */
export function matchesQuery(
  group: QueryGroup,
  record: Record<string, unknown>,
  fields: readonly QueryField[],
  now: number = Date.now(),
): boolean {
  const results = group.rules
    .filter((node) => isGroup(node) || isComplete(node, fields))
    .map((node) =>
      isGroup(node)
        ? matchesQuery(node, record, fields, now)
        : test(node, record, fields, now),
    );
  if (!results.length) return true;
  return group.combinator === "and"
    ? results.every(Boolean)
    : results.some(Boolean);
}

function test(
  rule: QueryRule,
  record: Record<string, unknown>,
  fields: readonly QueryField[],
  now: number,
) {
  const field = fields.find((f) => f.id === rule.field)!;
  const actual = record[rule.field];
  const v = rule.value;
  switch (field.type) {
    case "text": {
      const a = String(actual ?? "").toLowerCase(),
        b = String(v ?? "").toLowerCase();
      if (rule.operator === "contains") return a.includes(b);
      if (rule.operator === "not_contains") return !a.includes(b);
      if (rule.operator === "is") return a === b;
      if (rule.operator === "is_not") return a !== b;
      if (rule.operator === "starts") return a.startsWith(b);
      if (rule.operator === "empty") return a === "";
      return a !== "";
    }
    case "number": {
      const a = Number(actual);
      if (!Number.isFinite(a)) return false;
      if (rule.operator === "between") {
        const [lo, hi] = v as [number, number];
        return a >= Math.min(lo, hi) && a <= Math.max(lo, hi);
      }
      const b = v as number;
      return (
        {
          eq: a === b,
          ne: a !== b,
          gt: a > b,
          gte: a >= b,
          lt: a < b,
          lte: a <= b,
        }[rule.operator] ?? false
      );
    }
    case "date": {
      const a = day(actual);
      if (!Number.isFinite(a)) return false;
      if (rule.operator === "last")
        return a <= day(now) && a > day(now) - (v as number);
      const b = day(v);
      return rule.operator === "on"
        ? a === b
        : rule.operator === "before"
          ? a < b
          : a > b;
    }
    case "select": {
      const a = String(actual ?? "");
      if (rule.operator === "is") return a === v;
      if (rule.operator === "is_not") return a !== v;
      const set = v as readonly string[];
      return rule.operator === "any" ? set.includes(a) : !set.includes(a);
    }
    default:
      return rule.operator === "true" ? actual === true : actual === false;
  }
}

/** A readable sentence for the whole query, e.g. for a saved segment's description. */
export function describeQuery(
  group: QueryGroup,
  fields: readonly QueryField[],
  nested = false,
): string {
  const parts = group.rules
    .filter((node) => isGroup(node) || isComplete(node, fields))
    .map((node) =>
      isGroup(node)
        ? describeQuery(node, fields, true)
        : describeRule(node, fields),
    )
    .filter(Boolean);
  if (!parts.length) return nested ? "" : "Everything";
  const joined = parts.join(group.combinator === "and" ? ", and " : ", or ");
  return nested && parts.length > 1 ? `(${joined})` : joined;
}

function describeRule(rule: QueryRule, fields: readonly QueryField[]) {
  const field = fields.find((f) => f.id === rule.field)!;
  const op = operatorOf(field, rule.operator)!;
  const label = (value: string) =>
    field.options?.find((o) => o.value === value)?.label ?? value;
  const unit = field.unit ? ` ${field.unit}` : "";
  const v = rule.value;
  const value =
    op.arity === 0
      ? ""
      : op.arity === 2
        ? ` ${(v as readonly number[])[0]}${unit} and ${(v as readonly number[])[1]}${unit}`
        : op.arity === "many"
          ? ` ${(v as readonly string[]).map(label).join(", ")}`
          : field.type === "date" && op.id === "last"
            ? ` ${v} days`
            : ` ${typeof v === "string" ? (field.type === "select" ? label(v) : `“${v}”`) : `${v}${unit}`}`;
  return `${field.label} ${op.label}${value}`;
}
