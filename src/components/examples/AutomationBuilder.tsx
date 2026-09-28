"use client";

import { useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  DataTable,
  DescriptionList,
  FlowGraph,
  QueryBuilder,
  SegmentedControl,
  SplitFlap,
  describeQuery,
  matchesQuery,
  type FlowEdge,
  type FlowNode,
  type FlowStatus,
  type QueryField,
  type QueryGroup,
} from "@/mizu";
import { seeded } from "@/components/docs/demos/signature/shared";

// An invented harbour's berth bookings and the rule that routes them.
const FIELDS: QueryField[] = [
  {
    id: "type",
    label: "Vessel type",
    type: "select",
    options: [
      { value: "container", label: "Container ship" },
      { value: "tanker", label: "Tanker" },
      { value: "ferry", label: "Ferry" },
      { value: "yacht", label: "Yacht" },
    ],
  },
  { id: "length", label: "Length", type: "number", unit: "m" },
  { id: "hazardous", label: "Hazardous cargo", type: "boolean" },
  { id: "agent", label: "Agent", type: "text" },
];
type Booking = {
  id: string;
  vessel: string;
  type: string;
  length: number;
  hazardous: boolean;
  agent: string;
};
const NAMES = [
  "Kestrel Bay",
  "Northern Lamp",
  "Saltmarsh",
  "Aoi Maru",
  "Tern",
  "Harbour Light",
  "Copper Gull",
  "Mistral",
  "Low Tide",
  "Kittiwake",
  "Ember Line",
  "Selkie",
  "Fair Isle",
  "Blue Current",
  "Longshore",
  "Petrel",
  "Ostara",
  "Grey Heron",
  "Sea Lantern",
  "Whitby Rose",
];
const AGENTS = [
  "Mersey Shipping",
  "Northway Agency",
  "Tidewater & Co",
  "Harbour Direct",
];
const TYPES = ["container", "tanker", "ferry", "yacht"] as const;
const BOOKINGS: Booking[] = (() => {
  const rand = seeded(11);
  return NAMES.map((vessel, i) => {
    const type = TYPES[Math.floor(rand() * TYPES.length)]!;
    const base = { container: 210, tanker: 190, ferry: 130, yacht: 30 }[type];
    return {
      id: `b${i}`,
      vessel,
      type,
      length: Math.round(base * (0.6 + rand() * 0.8)),
      hazardous: type === "tanker" ? rand() < 0.7 : rand() < 0.1,
      agent: AGENTS[Math.floor(rand() * AGENTS.length)]!,
    };
  });
})();
const START: QueryGroup = {
  id: "root",
  combinator: "and",
  rules: [
    { id: "r1", field: "length", operator: "gt", value: 160 },
    {
      id: "r2",
      field: "type",
      operator: "any",
      value: ["container", "tanker"],
    },
  ],
};
const NODES: FlowNode[] = [
  {
    id: "booking",
    x: 24,
    y: 136,
    kind: "TRIGGER",
    label: "New berth booking",
    description: "From the harbour booking form",
    inputs: [],
  },
  {
    id: "filter",
    x: 316,
    y: 136,
    kind: "CONDITION",
    label: "Needs a crane berth?",
    outputs: ["yes", "no"],
  },
  {
    id: "crane",
    x: 640,
    y: 40,
    kind: "ACTION",
    label: "Reserve a crane berth",
    description: "Holds the berth for the arrival window",
  },
  {
    id: "notify",
    x: 940,
    y: 40,
    kind: "ACTION",
    label: "Notify the harbourmaster",
    outputs: [],
  },
  {
    id: "queue",
    x: 640,
    y: 250,
    kind: "ACTION",
    label: "Queue for a standard berth",
    description: "First free berth on arrival",
    outputs: [],
  },
];
const EDGES: FlowEdge[] = [
  { id: "e1", source: "booking", target: "filter" },
  {
    id: "e2",
    source: "filter",
    sourcePort: "yes",
    target: "crane",
    label: "yes",
  },
  { id: "e3", source: "crane", target: "notify" },
  {
    id: "e4",
    source: "filter",
    sourcePort: "no",
    target: "queue",
    label: "no",
  },
];
const TYPE_LABEL = Object.fromEntries(
  FIELDS[0]!.options!.map((o) => [o.value, o.label]),
);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function AutomationBuilder() {
  const [query, setQuery] = useState<QueryGroup>(START);
  const [nodes, setNodes] = useState<FlowNode[]>(NODES);
  const [edges, setEdges] = useState<FlowEdge[]>(EDGES);
  const [selected, setSelected] = useState<string | null>("filter");
  const [sample, setSample] = useState(BOOKINGS[0]!.id);
  const [status, setStatus] = useState<Record<string, FlowStatus>>({});
  const [running, setRunning] = useState(false);
  const runRef = useRef(0);
  useEffect(() => () => void (runRef.current += 1), []);

  const summary = describeQuery(query, FIELDS) || "Every booking";
  const matches = (b: Booking) => matchesQuery(query, b, FIELDS);
  const crane = BOOKINGS.filter(matches).length;
  const node = nodes.find((n) => n.id === selected);

  // A dry run: each step lights up in turn along the path the booking takes.
  const run = async () => {
    const booking = BOOKINGS.find((b) => b.id === sample)!;
    const token = ++runRef.current;
    const path = matches(booking) ? ["crane", "notify"] : ["queue"];
    const skipped = matches(booking) ? ["queue"] : ["crane", "notify"];
    setRunning(true);
    setStatus({});
    for (const id of ["booking", "filter", ...path]) {
      setStatus((s) => ({ ...s, [id]: "running" }));
      await wait(550);
      if (runRef.current !== token) return;
      setStatus((s) => ({
        ...s,
        [id]: "success",
        ...(id === "filter"
          ? Object.fromEntries(skipped.map((k) => [k, "skipped" as const]))
          : {}),
      }));
    }
    setRunning(false);
  };

  return (
    <div className="mizu-automation">
      <FlowGraph
        label="Berth booking automation"
        nodes={nodes.map((n) => ({
          ...n,
          description: n.id === "filter" ? summary : n.description,
          status: status[n.id] ?? "idle",
        }))}
        onNodesChange={setNodes}
        edges={edges}
        onEdgesChange={setEdges}
        selected={selected}
        onSelectedChange={setSelected}
        style={{ ["--mizu-flow-height" as string]: "380px" }}
      />

      <div className="mizu-automation-grid">
        <section className="mizu-automation-panel" aria-label="Selected step">
          {selected === "filter" ? (
            <QueryBuilder
              label="Needs a crane berth when"
              fields={FIELDS}
              value={query}
              onValueChange={setQuery}
              footer={`${crane} of ${BOOKINGS.length} bookings take the crane path`}
            />
          ) : node ? (
            <div className="mizu-automation-step">
              <p className="mizu-incident-label">{node.kind}</p>
              <h2>{node.label}</h2>
              <DescriptionList
                items={[
                  { label: "Does", value: node.description ?? "—" },
                  {
                    label: "Runs after",
                    value:
                      edges
                        .filter((e) => e.target === node.id)
                        .map((e) => nodes.find((n) => n.id === e.source)?.label)
                        .join(", ") || "Nothing — it starts the flow",
                  },
                ]}
              />
              <p className="mizu-automation-hint">
                Choose the condition to edit the rule that routes bookings.
              </p>
            </div>
          ) : (
            <p className="mizu-automation-hint">
              Choose a step to see what it does.
            </p>
          )}
        </section>

        <section className="mizu-automation-panel" aria-label="Dry run">
          <p className="mizu-incident-label">Dry run</p>
          <SplitFlap
            value={`${crane} OF ${BOOKINGS.length}`}
            length={8}
            label="Bookings on the crane path"
            live
            style={{ ["--mizu-flap-size" as string]: "26px" }}
          />
          <SegmentedControl
            label="Booking to run"
            value={sample}
            onValueChange={setSample}
            options={BOOKINGS.slice(0, 4).map((b) => ({
              value: b.id,
              label: b.vessel,
            }))}
          />
          <Button onClick={run} loading={running} arrow={false}>
            Run the flow
          </Button>
        </section>
      </div>

      <DataTable
        label="Upcoming bookings and their route"
        rows={BOOKINGS}
        getRowId={(b) => b.id}
        columns={[
          {
            id: "vessel",
            header: "Vessel",
            render: (b) => b.vessel,
            sortValue: (b) => b.vessel,
          },
          {
            id: "type",
            header: "Type",
            render: (b) => TYPE_LABEL[b.type],
            sortValue: (b) => b.type,
          },
          {
            id: "length",
            header: "Length",
            render: (b) => `${b.length} m`,
            sortValue: (b) => b.length,
            align: "right",
          },
          {
            id: "hazardous",
            header: "Hazardous",
            render: (b) => (b.hazardous ? "Yes" : "No"),
            sortValue: (b) => Number(b.hazardous),
          },
          {
            id: "agent",
            header: "Agent",
            render: (b) => b.agent,
            sortValue: (b) => b.agent,
          },
          {
            id: "route",
            header: "Route",
            render: (b) => (
              <Badge tone={matches(b) ? "accent" : "line"}>
                {matches(b) ? "Crane berth" : "Standard"}
              </Badge>
            ),
            sortValue: (b) => Number(matches(b)),
          },
        ]}
      />
    </div>
  );
}
