"use client";

import { useMemo, useState, type ReactNode } from "react";
export type DataColumn<T> = {
  id: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | null;
  align?: "left" | "right";
};
export function DataTable<T>({
  rows,
  columns,
  label,
  getRowId,
  empty = "No rows to show.",
  loading = false,
  className = "",
}: {
  rows: readonly T[];
  columns: readonly DataColumn<T>[];
  label: string;
  getRowId: (row: T) => string;
  empty?: ReactNode;
  loading?: boolean;
  className?: string;
}) {
  const [sort, setSort] = useState<{ id: string; direction: 1 | -1 } | null>(
    null,
  );
  const ordered = useMemo(() => {
    const column = columns.find((c) => c.id === sort?.id);
    if (!column?.sortValue || !sort) return rows;
    const value = column.sortValue;
    return [...rows].sort((a, b) => {
      const x = value(a),
        y = value(b);
      if (x === null) return y === null ? 0 : 1;
      if (y === null) return -1;
      return (
        sort.direction *
        (typeof x === "number" && typeof y === "number"
          ? x - y
          : String(x).localeCompare(String(y), undefined, { numeric: true }))
      );
    });
  }, [rows, columns, sort]);
  return (
    <div
      className={`mizu-table-scroll ${className}`}
      role="region"
      aria-label={label}
      tabIndex={0}
      aria-busy={loading}
    >
      <table className="mizu-data-table">
        <caption>{label}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.id}
                scope="col"
                style={{ textAlign: c.align ?? "left" }}
                aria-sort={
                  c.sortValue
                    ? sort?.id === c.id
                      ? sort.direction === 1
                        ? "ascending"
                        : "descending"
                      : "none"
                    : undefined
                }
              >
                {c.sortValue ? (
                  <button
                    type="button"
                    onClick={() =>
                      setSort((s) => ({
                        id: c.id,
                        direction: s?.id === c.id && s.direction === 1 ? -1 : 1,
                      }))
                    }
                  >
                    {c.header}
                    <span aria-hidden="true">
                      {sort?.id === c.id
                        ? sort.direction === 1
                          ? " ↑"
                          : " ↓"
                        : " ↕"}
                    </span>
                  </button>
                ) : (
                  c.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ordered.map((row) => (
            <tr key={getRowId(row)}>
              {columns.map((c) => (
                <td key={c.id} style={{ textAlign: c.align ?? "left" }}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td
                colSpan={Math.max(1, columns.length)}
                className="mizu-table-empty"
              >
                {loading ? "Loading rows…" : empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
