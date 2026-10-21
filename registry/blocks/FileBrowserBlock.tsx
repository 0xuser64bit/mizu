"use client";

import { useState } from "react";
import { Button } from "../button";
import { DataTable } from "../data-table";
import { DescriptionList } from "../description-list";
import { EmptyState } from "../empty-state";
import { SearchField } from "../search-field";
import { SelectField } from "../select-field";
import "./blocks.css";

const files = [
  {
    id: "readme",
    name: "Readme.md",
    kind: "Document",
    modified: "2026-10-21",
    content:
      "# Harbour studio\n\nA small sample project for Mizu.\n\nEvery interaction should explain what just happened.\n",
    mime: "text/markdown",
  },
  {
    id: "tokens",
    name: "Tokens.css",
    kind: "Stylesheet",
    modified: "2026-10-20",
    content:
      ":root {\n  --harbour-ink: #171715;\n  --harbour-paper: #f1eee8;\n  --harbour-signal: #e86545;\n}\n",
    mime: "text/css",
  },
  {
    id: "brief",
    name: "Interface brief.txt",
    kind: "Document",
    modified: "2026-10-19",
    content:
      "HARBOUR — INTERFACE BRIEF\n\nPurpose: help a team review work together.\n\nKeep the reading order clear. Make every action reversible. Design the empty state before the full one.\n",
    mime: "text/plain",
  },
  {
    id: "traffic",
    name: "Traffic.csv",
    kind: "Dataset",
    modified: "2026-10-18",
    content:
      "date,visits,signups\n2026-10-15,1840,94\n2026-10-16,2120,113\n2026-10-17,1960,102\n",
    mime: "text/csv",
  },
  {
    id: "release",
    name: "Release notes.md",
    kind: "Document",
    modified: "2026-10-17",
    content:
      "# Sample release notes\n\n- Added a shared review queue.\n- Kept keyboard selection aligned with pointer selection.\n- Made failed actions retryable.\n",
    mime: "text/markdown",
  },
] as const;

export function FileBrowserBlock() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [selection, setSelection] = useState<string>(files[0].id);
  const filtered = files.filter(
    (file) =>
      (kind === "all" || file.kind === kind) &&
      file.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const selected =
    filtered.find((file) => file.id === selection) ?? filtered[0];
  return (
    <section
      className="mizu-block mizu-block-files"
      aria-label="Sample file browser"
    >
      <div className="mizu-block-toolbar">
        <SearchField
          label="Find a file"
          value={query}
          onValueChange={setQuery}
          placeholder="Search sample files…"
        />
        <SelectField
          label="File type"
          value={kind}
          onChange={(event) => setKind(event.target.value)}
        >
          <option value="all">All types</option>
          <option value="Document">Documents</option>
          <option value="Stylesheet">Stylesheets</option>
          <option value="Dataset">Datasets</option>
        </SelectField>
      </div>
      <p className="mizu-block-readout" role="status">
        {filtered.length} of {files.length} sample files
      </p>
      <div className="mizu-block-file-workspace">
        <DataTable
          label="Project files"
          rows={filtered}
          getRowId={(file) => file.id}
          empty={
            <EmptyState
              title="No matching files"
              action={
                <Button
                  variant="ghost"
                  arrow={false}
                  onClick={() => {
                    setQuery("");
                    setKind("all");
                  }}
                >
                  Clear filters
                </Button>
              }
            >
              Try another name or file type.
            </EmptyState>
          }
          columns={[
            {
              id: "name",
              header: "Name",
              sortValue: (file) => file.name,
              render: (file) => (
                <button
                  type="button"
                  className="mizu-block-file-name"
                  aria-pressed={selected?.id === file.id}
                  onClick={() => setSelection(file.id)}
                >
                  {file.name}
                </button>
              ),
            },
            {
              id: "type",
              header: "Type",
              sortValue: (file) => file.kind,
              render: (file) => file.kind,
            },
            {
              id: "modified",
              header: "Modified",
              sortValue: (file) => file.modified,
              render: (file) => (
                <time dateTime={file.modified}>{file.modified}</time>
              ),
            },
          ]}
        />
        <aside className="mizu-block-file-detail" aria-label="File details">
          {selected ? (
            <>
              <h3>{selected.name}</h3>
              <DescriptionList
                items={[
                  { label: "Type", value: selected.kind },
                  {
                    label: "Size",
                    value: `${new TextEncoder().encode(selected.content).length} bytes`,
                  },
                  {
                    label: "Modified",
                    value: (
                      <time dateTime={selected.modified}>
                        {selected.modified}
                      </time>
                    ),
                  },
                ]}
              />
              <pre tabIndex={0} aria-label={`${selected.name} preview`}>
                {selected.content}
              </pre>
              <a
                className="mizu-block-download"
                href={`data:${selected.mime};charset=utf-8,${encodeURIComponent(selected.content)}`}
                download={selected.name}
              >
                Download sample file
              </a>
            </>
          ) : (
            <p className="mizu-field-hint">
              File details appear when a file matches your filters.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
