import { ArrowIcon } from "../ui/icons";
import type { ReactNode, HTMLAttributes } from "react";
export function DescriptionList({
  items,
  className = "",
  ...props
}: HTMLAttributes<HTMLDListElement> & {
  items: readonly { label: string; value: ReactNode }[];
}) {
  return (
    <dl className={`mizu-description-list ${className}`} {...props}>
      {items.map((item, i) => (
        <div key={i}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
export function Stat({
  label,
  value,
  change,
  detail,
  className = "",
}: {
  label: string;
  value: ReactNode;
  change?: {
    value: string;
    direction: "up" | "down" | "flat";
    favorable?: boolean;
  };
  detail?: string;
  className?: string;
}) {
  return (
    <div className={`mizu-stat ${className}`}>
      <p className="mizu-stat-label">{label}</p>
      <p className="mizu-stat-value">{value}</p>
      {change && (
        <p
          className="mizu-stat-change"
          data-favorable={change.favorable}
          aria-label={`${change.direction}: ${change.value}`}
        >
          <span aria-hidden="true">
            <ArrowIcon
              direction={
                change.direction === "flat" ? "right" : change.direction
              }
            />
          </span>{" "}
          {change.value}
        </p>
      )}
      {detail && <p className="mizu-field-hint">{detail}</p>}
    </div>
  );
}
export type TimelineEvent = {
  id: string;
  title: string;
  time: string;
  dateTime?: string;
  body?: ReactNode;
  state?: "complete" | "current" | "upcoming";
};
export function Timeline({
  items,
  label = "Timeline",
  className = "",
}: {
  items: readonly TimelineEvent[];
  label?: string;
  className?: string;
}) {
  return (
    <ol className={`mizu-timeline ${className}`} aria-label={label}>
      {items.map((item) => (
        <li key={item.id} data-state={item.state ?? "complete"}>
          <time dateTime={item.dateTime}>{item.time}</time>
          <div>
            <h3>{item.title}</h3>
            {item.body && <div className="mizu-timeline-body">{item.body}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}
export function ComparisonTable({
  label,
  columns,
  rows,
  className = "",
}: {
  label: string;
  columns: readonly string[];
  rows: readonly { label: string; values: readonly (string | boolean)[] }[];
  className?: string;
}) {
  return (
    <div
      className={`mizu-table-scroll ${className}`}
      tabIndex={0}
      role="region"
      aria-label={label}
    >
      <table className="mizu-comparison-table">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Feature</th>
            {columns.map((c) => (
              <th scope="col" key={c}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {columns.map((c, i) => (
                <td key={c}>
                  {typeof row.values[i] === "boolean" ? (
                    <span data-included={row.values[i]}>
                      {row.values[i] ? "Included" : "Not included"}
                    </span>
                  ) : (
                    (row.values[i] ?? "—")
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
