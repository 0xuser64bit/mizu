export const BLOCKS = [
  {
    id: "settings-block",
    title: "Workspace settings",
    description:
      "A labelled settings form with local persistence, draft recovery and honest save errors.",
    exportName: "SettingsBlock",
    source: "src/components/blocks/SettingsBlock.tsx",
    systems: ["button", "text-field", "select-field", "switch", "status"],
  },
  {
    id: "file-browser-block",
    title: "File browser",
    description:
      "Search and filter a small collection, inspect a file and download its original sample content.",
    exportName: "FileBrowserBlock",
    source: "src/components/blocks/FileBrowserBlock.tsx",
    systems: [
      "button",
      "search-field",
      "select-field",
      "data-table",
      "description-list",
      "empty-state",
    ],
  },
  {
    id: "analytics-block",
    title: "Analytics workspace",
    description:
      "A date window, a chart and sortable readings driven by the same sample dataset, with CSV export.",
    exportName: "AnalyticsBlock",
    source: "src/components/blocks/AnalyticsBlock.tsx",
    systems: [
      "date-range-field",
      "segmented-control",
      "trend-chart",
      "stat",
      "data-table",
    ],
  },
] as const;
