"use client";

import { useState } from "react";
import { DataTable } from "../data-table";
import { DateRangeField, type DateRange } from "../date-range-field";
import { SegmentedControl } from "../segmented-control";
import { Stat } from "../stat";
import { TrendChart } from "../trend-chart";
import "./blocks.css";

const readings = Array.from({ length: 21 }, (_, index) => ({
  date: `2026-10-${String(index + 1).padStart(2, "0")}`,
  visits: 1180 + index * 47 + ((index * 173) % 420),
  signups: 42 + index * 3 + ((index * 11) % 24),
}));
const initialWindow = { start: "2026-10-15", end: "2026-10-21" };
const number = new Intl.NumberFormat("en-US");
const day = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function AnalyticsBlock() {
  const [window, setWindow] = useState<DateRange>(initialWindow);
  const [metric, setMetric] = useState("visits");
  const filtered = readings.filter(
    (reading) =>
      (!window.start || reading.date >= window.start) &&
      (!window.end || reading.date <= window.end),
  );
  const visits = filtered.reduce((sum, reading) => sum + reading.visits, 0);
  const signups = filtered.reduce((sum, reading) => sum + reading.signups, 0);
  const csv = [
    "date,visits,signups",
    ...filtered.map(
      (reading) => `${reading.date},${reading.visits},${reading.signups}`,
    ),
  ].join("\n");
  return (
    <section
      className="mizu-block mizu-block-analytics"
      aria-label="Sample analytics workspace"
    >
      <div className="mizu-block-analytics-controls">
        <DateRangeField
          label="Reporting window"
          value={window}
          onValueChange={setWindow}
          defaultValue={initialWindow}
          min="2026-10-01"
          max="2026-10-21"
          hint="Illustrative data, October 1–21, 2026."
          presets={[
            { label: "Sample week", value: initialWindow },
            {
              label: "All sample dates",
              value: { start: "2026-10-01", end: "2026-10-21" },
            },
          ]}
        />
        <div className="mizu-block-analytics-summary">
          <Stat
            label="Visits"
            value={number.format(visits)}
            detail={`${filtered.length} days in view`}
          />
          <Stat
            label="Signups"
            value={number.format(signups)}
            detail={`${visits ? ((signups / visits) * 100).toFixed(1) : "0.0"}% of visits`}
          />
        </div>
      </div>
      <div className="mizu-block-toolbar">
        <SegmentedControl
          label="Plot metric"
          value={metric}
          onValueChange={setMetric}
          options={[
            { value: "visits", label: "Visits" },
            { value: "signups", label: "Signups" },
          ]}
        />
        <a
          className="mizu-block-download"
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
          download="mizu-sample-analytics.csv"
        >
          Export current CSV
        </a>
      </div>
      <TrendChart
        label={metric === "visits" ? "Sample visits" : "Sample signups"}
        series={[
          {
            id: metric,
            label: metric === "visits" ? "Visits" : "Signups",
            data: filtered.map((reading) => ({
              x: Date.parse(`${reading.date}T00:00:00Z`),
              y: metric === "visits" ? reading.visits : reading.signups,
            })),
            area: true,
          },
        ]}
        utc
        height={240}
        formatX={(timestamp) => day.format(timestamp)}
        format={(value) => number.format(value)}
        zero
        empty="No sample readings in this date window. Adjust the dates or choose a preset."
      />
      <DataTable
        label="Daily sample readings"
        rows={filtered}
        getRowId={(reading) => reading.date}
        empty="No readings match the date window."
        columns={[
          {
            id: "date",
            header: "Date",
            sortValue: (reading) => reading.date,
            render: (reading) => (
              <time dateTime={reading.date}>{reading.date}</time>
            ),
          },
          {
            id: "visits",
            header: "Visits",
            align: "right",
            sortValue: (reading) => reading.visits,
            render: (reading) => number.format(reading.visits),
          },
          {
            id: "signups",
            header: "Signups",
            align: "right",
            sortValue: (reading) => reading.signups,
            render: (reading) => number.format(reading.signups),
          },
        ]}
      />
    </section>
  );
}
