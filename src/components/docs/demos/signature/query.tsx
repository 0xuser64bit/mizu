"use client";

import { useMemo, useState } from "react";
import {
  DataTable,
  QueryBuilder,
  describeQuery,
  matchesQuery,
  type QueryField,
  type QueryGroup,
} from "@/mizu";
import { Scenarios, seeded } from "./shared";

const REGIONS = [
  "Germany",
  "France",
  "Japan",
  "Brazil",
  "Canada",
  "India",
  "Kenya",
  "Norway",
  "Mexico",
  "Australia",
];
const FIELDS: QueryField[] = [
  { id: "name", label: "Company", type: "text" },
  {
    id: "plan",
    label: "Plan",
    type: "select",
    options: [
      { value: "free", label: "Free" },
      { value: "pro", label: "Pro" },
      { value: "team", label: "Team" },
      { value: "enterprise", label: "Enterprise" },
    ],
  },
  { id: "seats", label: "Seats", type: "number", unit: "seats" },
  { id: "signedUp", label: "Signed up", type: "date" },
  {
    id: "region",
    label: "Region",
    type: "select",
    options: REGIONS.map((r) => ({ value: r, label: r })),
  },
  { id: "active", label: "Active this week", type: "boolean" },
];

// Illustrative accounts, generated deterministically.
const NOW = Date.UTC(2026, 8, 28);
type Account = {
  id: string;
  name: string;
  plan: string;
  seats: number;
  signedUp: string;
  region: string;
  active: boolean;
};
const ACCOUNTS: Account[] = (() => {
  const random = seeded(19);
  const first = [
    "North",
    "Quiet",
    "Bright",
    "Paper",
    "Lumen",
    "Harbor",
    "Cedar",
    "Signal",
    "Atlas",
    "Kite",
  ];
  const second = [
    "Works",
    "Labs",
    "Studio",
    "Freight",
    "Health",
    "Foods",
    "Bank",
    "Press",
  ];
  return Array.from({ length: 40 }, (_, i) => {
    const plan = ["free", "pro", "team", "enterprise"][
      Math.floor(random() ** 1.6 * 4)
    ]!;
    return {
      id: `acc-${i}`,
      name: `${first[Math.floor(random() * first.length)]} ${second[Math.floor(random() * second.length)]}`,
      plan,
      seats:
        plan === "free"
          ? 1 + Math.floor(random() * 3)
          : Math.round(
              (plan === "enterprise" ? 120 : 8) * (0.4 + random() * 2),
            ),
      signedUp: new Date(NOW - Math.floor(random() * 240) * 864e5)
        .toISOString()
        .slice(0, 10),
      region: REGIONS[Math.floor(random() * REGIONS.length)]!,
      active: random() > 0.3,
    };
  });
})();

const EXPANSION: QueryGroup = {
  id: "root",
  combinator: "and",
  rules: [
    { id: "r1", field: "plan", operator: "any", value: ["pro", "team"] },
    { id: "r2", field: "seats", operator: "gte", value: 10 },
    {
      id: "g1",
      combinator: "or",
      rules: [
        { id: "r3", field: "signedUp", operator: "last", value: 90 },
        {
          id: "r4",
          field: "region",
          operator: "any",
          value: ["Germany", "Norway", "Japan"],
        },
      ],
    },
  ],
};
const DORMANT: QueryGroup = {
  id: "root",
  combinator: "and",
  rules: [
    { id: "d1", field: "active", operator: "false" },
    { id: "d2", field: "plan", operator: "is_not", value: "free" },
    { id: "d3", field: "name", operator: "contains" },
  ],
};

type Scenario = "expansion" | "dormant" | "blank";

export function QueryBuilderShowcase() {
  const [scenario, setScenario] = useState<Scenario>("expansion");
  const [query, setQuery] = useState<QueryGroup>(EXPANSION);
  const matches = useMemo(
    () => ACCOUNTS.filter((a) => matchesQuery(query, a, FIELDS, NOW)),
    [query],
  );
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="Scenario"
        value={scenario}
        onChange={(v) => {
          setScenario(v);
          setQuery(
            v === "expansion"
              ? EXPANSION
              : v === "dormant"
                ? DORMANT
                : { id: "root", combinator: "and", rules: [] },
          );
        }}
        options={[
          { value: "expansion", label: "Expansion segment" },
          { value: "dormant", label: "Dormant, with a draft rule" },
          { value: "blank", label: "Blank" },
        ]}
        note="Illustrative accounts. The table below is filtered live with matchesQuery; the reading comes from describeQuery."
      />
      <QueryBuilder
        key={scenario}
        label="Audience"
        fields={FIELDS}
        value={query}
        onValueChange={setQuery}
        footer={
          <span role="status">
            {matches.length} of {ACCOUNTS.length} accounts
          </span>
        }
      />
      <DataTable
        label={`Matching accounts — ${describeQuery(query, FIELDS)}`}
        rows={matches.slice(0, 8)}
        getRowId={(a) => a.id}
        empty="No account matches every condition."
        columns={[
          {
            id: "name",
            header: "Company",
            render: (a) => a.name,
            sortValue: (a) => a.name,
          },
          {
            id: "plan",
            header: "Plan",
            render: (a) => a.plan,
            sortValue: (a) => a.plan,
          },
          {
            id: "seats",
            header: "Seats",
            render: (a) => a.seats,
            sortValue: (a) => a.seats,
            align: "right",
          },
          { id: "region", header: "Region", render: (a) => a.region },
          {
            id: "signedUp",
            header: "Signed up",
            render: (a) => a.signedUp,
            sortValue: (a) => a.signedUp,
          },
        ]}
      />
    </div>
  );
}
