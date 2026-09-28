"use client";

import { useRef, useState } from "react";
import {
  Avatar,
  Badge,
  ColumnBrowser,
  DescriptionList,
  ImageFigure,
  type BrowserItem,
} from "@/mizu";
import { PLATES } from "./plates";
import { Scenarios } from "./shared";

type Scenario = "files" | "people";

const icon = (d: string) => (
  <svg
    viewBox="0 0 14 14"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
  >
    <path d={d} />
  </svg>
);
const FOLDER = icon("M1.5 3.5h4l1 1.5h6v6.5h-11z");
const FILE = icon("M3 1.5h5l3 3v8H3z M8 1.5v3h3");
const IMAGE = icon("M1.5 2.5h11v9h-11z M1.5 9l3-3 3 3 2-2 3 3");

// An invented project. Folders marked `hasChildren` load on first visit.
type File = BrowserItem & {
  kind?: "code" | "image" | "text";
  body?: string;
  plate?: number;
};
const file = (
  id: string,
  label: string,
  meta: string,
  extra: Partial<File> = {},
): File => ({
  id,
  label,
  meta,
  icon: extra.kind === "image" ? IMAGE : FILE,
  ...extra,
});
const folder = (
  id: string,
  label: string,
  extra: Partial<BrowserItem> = {},
): BrowserItem => ({
  id,
  label,
  icon: FOLDER,
  ...extra,
});

const PROJECT: BrowserItem[] = [
  folder("src", "src", {
    children: [
      folder("src/components", "components", { hasChildren: true }),
      folder("src/routes", "routes", { hasChildren: true }),
      file("src/main.tsx", "main.tsx", "1.2 KB", {
        kind: "code",
        body: 'import { createRoot } from "react-dom/client";\nimport { App } from "./app";\n\ncreateRoot(document.getElementById("root")!)\n  .render(<App />);',
      }),
    ],
  }),
  folder("assets", "assets", { hasChildren: true }),
  folder("archive", "archive", { hasChildren: true, meta: "offline" }),
  folder("empty", "drafts", { children: [] }),
  file("readme", "README.md", "3.4 KB", {
    kind: "text",
    body: "# Harbour\n\nA field app for tide and berth schedules.\nRun `bun dev` and open the harbour you manage.",
  }),
  file("license", "LICENSE", "1.1 KB", {
    kind: "text",
    body: "Permission is hereby granted, free of charge…",
  }),
];
const LAZY: Record<string, BrowserItem[]> = {
  "src/components": [
    file("c/berth", "BerthCard.tsx", "4.8 KB", {
      kind: "code",
      body: "export function BerthCard({ berth }: Props) {\n  return (\n    <Card title={berth.name}>\n      <TideLine data={berth.tides} />\n    </Card>\n  );\n}",
    }),
    file("c/tide", "TideLine.tsx", "6.1 KB", {
      kind: "code",
      body: 'export function TideLine({ data }: { data: Tide[] }) {\n  return <TrendChart label="Tide" series={toSeries(data)} />;\n}',
    }),
    file("c/radio", "RadioLog.tsx", "2.9 KB", {
      kind: "code",
      body: "export const RadioLog = () => null;",
    }),
  ],
  "src/routes": [
    file("r/index", "index.tsx", "0.9 KB", {
      kind: "code",
      body: 'export default function Home() {\n  return <Harbour id="north" />;\n}',
    }),
    file("r/berths", "berths.tsx", "2.2 KB", {
      kind: "code",
      body: "export default function Berths() {\n  return <BerthList />;\n}",
    }),
  ],
  assets: PLATES.slice(0, 6).map((plate, i) =>
    file(`a/${plate.id}`, `${plate.id}.svg`, `${plate.width}×${plate.height}`, {
      kind: "image",
      plate: i,
    }),
  ),
  archive: [
    file("x/2019", "tides-2019.csv", "88 KB", {
      kind: "text",
      body: "date,high,low\n2019-01-01,4.12,0.88\n2019-01-02,4.05,0.91",
    }),
    file("x/2020", "tides-2020.csv", "91 KB", {
      kind: "text",
      body: "date,high,low\n2020-01-01,4.20,0.79\n2020-01-02,4.18,0.83",
    }),
  ],
};

function FilePreview({ item }: { item: File }) {
  const plate = item.plate === undefined ? undefined : PLATES[item.plate];
  return (
    <div className="mizu-demo-preview">
      {plate ? (
        <ImageFigure src={plate.src} alt={plate.alt} />
      ) : (
        <pre>{item.body}</pre>
      )}
      <p>{item.label}</p>
      <DescriptionList
        items={[
          {
            label: "Kind",
            value:
              item.kind === "image"
                ? "Image"
                : item.kind === "code"
                  ? "Source"
                  : "Text",
          },
          { label: "Size", value: item.meta },
        ]}
      />
    </div>
  );
}

// An invented organisation, fully known up front.
type Person = BrowserItem & { role?: string; since?: string };
const person = (
  id: string,
  label: string,
  role: string,
  since: string,
): Person => ({
  id,
  label,
  meta: role.split(" ")[0],
  role,
  since,
  icon: <Avatar name={label} size={18} />,
});
const PEOPLE: BrowserItem[] = [
  {
    id: "design",
    label: "Design",
    meta: "2 teams",
    children: [
      {
        id: "brand",
        label: "Brand",
        meta: "3",
        children: [
          person("aiko", "Aiko Tanaka", "Lead designer", "2019"),
          person("ruth", "Ruth Mensah", "Illustrator", "2022"),
          person("oli", "Oliver Grant", "Type designer", "2021"),
        ],
      },
      {
        id: "product",
        label: "Product design",
        meta: "2",
        children: [
          person("sana", "Sana Qureshi", "Product designer", "2020"),
          person("leo", "Léo Martin", "Design engineer", "2023"),
        ],
      },
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    meta: "2 teams",
    children: [
      {
        id: "platform",
        label: "Platform",
        meta: "2",
        children: [
          person("kofi", "Kofi Boateng", "Staff engineer", "2018"),
          person("ines", "Inês Duarte", "Site reliability", "2021"),
        ],
      },
      {
        id: "apps",
        label: "Apps",
        meta: "2",
        children: [
          person("mei", "Mei Chen", "Mobile engineer", "2022"),
          person("tom", "Tomás Ruiz", "Frontend engineer", "2020"),
        ],
      },
    ],
  },
  { id: "research", label: "Research", meta: "hiring", children: [] },
];

function PersonPreview({
  item,
  trail,
}: {
  item: Person;
  trail: readonly BrowserItem[];
}) {
  return (
    <div className="mizu-demo-preview">
      <Avatar name={item.label} size={72} />
      <p>{item.label}</p>
      <Badge tone="accent">{item.role}</Badge>
      <DescriptionList
        items={[
          {
            label: "Team",
            value: trail
              .slice(0, -1)
              .map((t) => t.label)
              .join(" / "),
          },
          { label: "Since", value: item.since },
        ]}
      />
    </div>
  );
}

export function ColumnBrowserShowcase() {
  const [scenario, setScenario] = useState<Scenario>("files");
  const [path, setPath] = useState<readonly string[]>([
    "src",
    "src/components",
  ]);
  const [opened, setOpened] = useState<string | null>(null);
  const failedOnceRef = useRef(false);
  const load = (item: BrowserItem) =>
    new Promise<BrowserItem[]>((resolve, reject) =>
      setTimeout(
        () => {
          if (item.id === "archive" && !failedOnceRef.current) {
            failedOnceRef.current = true;
            reject(new Error("The archive server did not answer."));
          } else resolve(LAZY[item.id] ?? []);
        },
        450 + (item.id.length % 4) * 150,
      ),
    );
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="Hierarchy"
        value={scenario}
        onChange={(v) => {
          setScenario(v);
          setPath(
            v === "files"
              ? ["src", "src/components"]
              : ["design", "brand", "aiko"],
          );
          setOpened(null);
        }}
        options={[
          { value: "files", label: "Project files" },
          { value: "people", label: "Organisation" },
        ]}
        note="Choose a folder and its contents open alongside; arrows walk the columns and typing jumps to a name. Folders load on first visit, and the archive fails once so you can retry. Narrow the preview to push and pop panes. Invented data."
      />
      {scenario === "files" ? (
        <ColumnBrowser
          key="files"
          label="harbour-app"
          items={PROJECT}
          loadChildren={load}
          path={path}
          onPathChange={setPath}
          onOpen={(item) => setOpened(item.label)}
          empty="This folder is empty."
          renderPreview={(item) => <FilePreview item={item as File} />}
        />
      ) : (
        <ColumnBrowser
          key="people"
          label="Company"
          items={PEOPLE}
          path={path}
          onPathChange={setPath}
          onOpen={(item) => setOpened(item.label)}
          empty="No one here yet."
          renderPreview={(item, trail) => (
            <PersonPreview item={item as Person} trail={trail} />
          )}
        />
      )}
      <p className="mizu-showcase-readout">
        <span>path · onOpen</span>
        {path.join(" / ") || "Nothing selected"}
        {opened && <output>Opened {opened}</output>}
      </p>
    </div>
  );
}
