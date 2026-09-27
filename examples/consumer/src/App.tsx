import { useState } from "react";
import {
  AppShell,
  Stack,
  Grid,
  InlineEdit,
  HistoryControls,
  useHistory,
  SearchField,
  DataTable,
  Status,
  Checklist,
  AsyncButton,
  ConfirmAction,
  CommandPalette,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsPanel,
  Timeline,
  Switch,
  SaveIndicator,
  DescriptionList,
  SegmentedControl,
  TagInput,
  MotionPreferences,
} from "mizu-ui";
import type { ChecklistItem } from "mizu-ui/content";

const initial = [
  { id: "a", name: "WaveText", family: "Type", state: "Review" },
  { id: "b", name: "Button", family: "Foundation", state: "Ready" },
  { id: "c", name: "Signal", family: "Instruments", state: "Draft" },
];
type StoredWorkspace = {
  name: string;
  rows: typeof initial;
  checks: ChecklistItem[];
  tags: string[];
};
function readRows(data: unknown): typeof initial {
  if (
    !Array.isArray(data) ||
    !data.every(
      (r) =>
        r &&
        typeof r.id === "string" &&
        typeof r.name === "string" &&
        typeof r.family === "string" &&
        ["Draft", "Review", "Ready"].includes(r.state),
    ) ||
    new Set(data.map((r) => r.id)).size !== data.length
  )
    throw new Error("Saved pieces have an invalid format.");
  return data.map((r) => ({
    id: r.id,
    name: r.name,
    family: r.family,
    state: r.state,
  }));
}
function readArchive() {
  return readRows(
    JSON.parse(localStorage.getItem("mizu-archived-drafts") ?? "[]"),
  );
}
function readSavedWorkspace(): StoredWorkspace {
  const text = localStorage.getItem("mizu-workshop");
  if (!text) throw new Error("No saved workspace on this device.");
  const data = JSON.parse(text) as Partial<StoredWorkspace>;
  if (
    typeof data?.name !== "string" ||
    !Array.isArray(data.checks) ||
    !data.checks.every(
      (c) =>
        c &&
        typeof c.id === "string" &&
        typeof c.label === "string" &&
        typeof c.checked === "boolean" &&
        (c.description === undefined || typeof c.description === "string") &&
        (c.disabled === undefined || typeof c.disabled === "boolean"),
    ) ||
    !Array.isArray(data.tags) ||
    !data.tags.every((t) => typeof t === "string") ||
    new Set(data.checks.map((c) => c.id)).size !== data.checks.length
  )
    throw new Error("Saved workspace has an invalid format.");
  return {
    name: data.name,
    rows: readRows(data.rows),
    checks: data.checks.map((c) => ({
      id: c.id,
      label: c.label,
      checked: c.checked,
      description: c.description,
      disabled: c.disabled,
    })),
    tags: data.tags,
  };
}
export function App() {
  const name = useHistory("Workshop release"),
    [rows, setRows] = useState(initial),
    [search, setSearch] = useState(""),
    [open, setOpen] = useState(false),
    [light, setLight] = useState(false),
    [reduced, setReduced] = useState(false),
    [saved, setSaved] = useState(false),
    [filter, setFilter] = useState("all"),
    [tags, setTags] = useState(["React", "Typed"]),
    [events, setEvents] = useState([
      {
        id: "start",
        title: "Workspace opened",
        time: "This session",
        body: "Demonstration records; edits stay on this device.",
      },
    ]);
  const [checks, setChecks] = useState<ChecklistItem[]>([
    { id: "types", label: "Review the API", checked: false },
    {
      id: "browser",
      label: "Try the keyboard paths",
      description: "Search, edit, undo and open the commands.",
      checked: false,
    },
    {
      id: "pack",
      label: "Verify the package",
      checked: true,
      description: "This app imports the installed tarball.",
    },
  ]);
  const event = (title: string) =>
    setEvents((e) => [
      ...e,
      {
        id: crypto.randomUUID(),
        title,
        time: new Date().toLocaleTimeString(),
        body: "Local action.",
      },
    ]);
  const add = () => {
    setRows((r) => [
      ...r,
      {
        id: crypto.randomUUID(),
        name: "Untitled piece",
        family: "Content",
        state: "Draft",
      },
    ]);
    setSaved(false);
    event("Draft created");
  };
  return (
    <div
      className="mizu-root"
      data-theme={light ? "light" : "dark"}
      style={{ minHeight: "100vh", padding: "clamp(16px,4vw,48px)" }}
    >
      <MotionPreferences reduced={reduced ? true : undefined}>
        <AppShell
          mainId="consumer-main"
          header={
            <Stack direction="row" wrap align="center" gap={20}>
              <strong
                style={{ fontWeight: 900, fontSize: 22, marginRight: "auto" }}
              >
                MIZU.
              </strong>
              <Switch
                label="Light surface"
                checked={light}
                onChange={(e) => setLight(e.target.checked)}
              />
              <Switch
                label="Reduce motion"
                checked={reduced}
                onChange={(e) => setReduced(e.target.checked)}
              />
            </Stack>
          }
          footer={
            <p className="mizu-field-hint">
              Synthetic workshop records. Save writes to this browser's local
              storage. No service or account is implied.
            </p>
          }
        >
          <Stack gap={32}>
            <div>
              <h1
                style={{
                  fontSize: "clamp(32px,5vw,56px)",
                  margin: "0 0 16px",
                  letterSpacing: "-.035em",
                }}
              >
                Your next release.
              </h1>
              <InlineEdit
                label="Release name"
                value={name.value}
                onValueChange={(v) => {
                  name.set(v);
                  setSaved(false);
                }}
                validate={(v) =>
                  v.trim() ? undefined : "Give this release a name."
                }
              />
              <div style={{ marginTop: 16 }}>
                <HistoryControls
                  onUndo={() => {
                    name.undo();
                    setSaved(false);
                  }}
                  onRedo={() => {
                    name.redo();
                    setSaved(false);
                  }}
                  canUndo={name.canUndo}
                  canRedo={name.canRedo}
                />
              </div>
            </div>
            <Stack direction="row" wrap align="center" gap={12}>
              <Button size="sm" onClick={add}>
                Create draft
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
                Commands
              </Button>
              <AsyncButton
                size="sm"
                action={async () => {
                  localStorage.setItem(
                    "mizu-workshop",
                    JSON.stringify({ name: name.value, rows, checks, tags }),
                  );
                  setSaved(true);
                  event("Workspace saved");
                }}
                successLabel="Saved"
              >
                Save locally
              </AsyncButton>
              <AsyncButton
                size="sm"
                variant="ghost"
                action={async () => {
                  const data = readSavedWorkspace();
                  name.reset(data.name);
                  setRows(data.rows);
                  setChecks(data.checks);
                  setTags(data.tags);
                  setSaved(true);
                  event("Saved workspace restored");
                }}
                successLabel="Restored"
              >
                Restore saved
              </AsyncButton>
              <SaveIndicator state={saved ? "saved" : "unsaved"} />
            </Stack>
            <Tabs defaultValue="pieces">
              <TabsList label="Workspace view">
                <TabsTrigger value="pieces">Pieces</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsPanel value="pieces">
                <Stack gap={24}>
                  <SearchField
                    label="Find a piece"
                    value={search}
                    onValueChange={setSearch}
                  />
                  <SegmentedControl
                    label="State"
                    value={filter}
                    onValueChange={setFilter}
                    options={[
                      { value: "all", label: "All" },
                      { value: "Ready", label: "Ready" },
                      { value: "Draft", label: "Draft" },
                    ]}
                  />
                  <DataTable
                    label="Release pieces"
                    rows={rows.filter(
                      (r) =>
                        r.name.toLowerCase().includes(search.toLowerCase()) &&
                        (filter === "all" || r.state === filter),
                    )}
                    getRowId={(r) => r.id}
                    columns={[
                      {
                        id: "name",
                        header: "Piece",
                        render: (r) => r.name,
                        sortValue: (r) => r.name,
                      },
                      {
                        id: "family",
                        header: "Family",
                        render: (r) => r.family,
                        sortValue: (r) => r.family,
                      },
                      {
                        id: "state",
                        header: "State",
                        render: (r) => (
                          <Status
                            tone={r.state === "Ready" ? "success" : "neutral"}
                          >
                            {r.state}
                          </Status>
                        ),
                        sortValue: (r) => r.state,
                      },
                    ]}
                  />
                </Stack>
              </TabsPanel>
              <TabsPanel value="history">
                <Timeline label="Session history" items={events} />
              </TabsPanel>
            </Tabs>
            <Grid minWidth={260} gap={40}>
              <Checklist
                label="Before release"
                items={checks}
                onChange={(id, checked) => {
                  setChecks((c) =>
                    c.map((i) => (i.id === id ? { ...i, checked } : i)),
                  );
                  setSaved(false);
                }}
              />
              <Stack gap={24}>
                <TagInput
                  label="Release tags"
                  value={tags}
                  onValueChange={(v) => {
                    setTags(v);
                    setSaved(false);
                  }}
                />
                <DescriptionList
                  items={[
                    { label: "Package", value: "mizu-ui" },
                    { label: "Storage", value: "This device" },
                    { label: "Format", value: "Native ESM" },
                  ]}
                />
                <ConfirmAction
                  label="Archive drafts"
                  title="Archive the unfinished pieces?"
                  confirmLabel="Archive"
                  action={async () => {
                    const drafts = rows.filter((r) => r.state === "Draft");
                    localStorage.setItem(
                      "mizu-archived-drafts",
                      JSON.stringify([
                        ...new Map(
                          [...readArchive(), ...drafts].map((r) => [r.id, r]),
                        ).values(),
                      ]),
                    );
                    setRows((r) => r.filter((i) => i.state !== "Draft"));
                    setSaved(false);
                    event(`${drafts.length} drafts archived`);
                  }}
                >
                  Drafts move into a recoverable local archive; ready pieces
                  remain in this list.
                </ConfirmAction>
                <AsyncButton
                  size="sm"
                  variant="ghost"
                  action={async () => {
                    const archived = readArchive();
                    localStorage.removeItem("mizu-archived-drafts");
                    setRows((r) => [
                      ...new Map(
                        [...archived, ...r].map((i) => [i.id, i]),
                      ).values(),
                    ]);
                    setSaved(false);
                    event(`${archived.length} archived drafts restored`);
                  }}
                  successLabel="Recovered"
                >
                  Recover archive
                </AsyncButton>
              </Stack>
            </Grid>
          </Stack>
          <CommandPalette
            open={open}
            onOpenChange={setOpen}
            commands={[
              { id: "new", label: "Create a draft", onSelect: add },
              {
                id: "theme",
                label: light ? "Use ink surface" : "Use paper surface",
                onSelect: () => setLight(!light),
              },
              {
                id: "motion",
                label: reduced ? "Follow system motion" : "Reduce motion",
                onSelect: () => setReduced(!reduced),
              },
            ]}
          />
        </AppShell>
      </MotionPreferences>
    </div>
  );
}
