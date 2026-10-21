import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { SettingsBlock } from "@/components/blocks/SettingsBlock";
import { FileBrowserBlock } from "@/components/blocks/FileBrowserBlock";
import { AnalyticsBlock } from "@/components/blocks/AnalyticsBlock";
import { BLOCKS } from "@/components/blocks/manifest";
import { GET } from "@/app/r/[slug]/route";
import registry from "../../registry.json";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("Mizu Blocks", () => {
  it("saves actual settings, restores them on remount and discards a draft", async () => {
    const user = userEvent.setup();
    const first = render(<SettingsBlock />);
    await user.clear(screen.getByLabelText("Workspace name"));
    await user.type(screen.getByLabelText("Workspace name"), "Paper studio");
    await user.click(screen.getByRole("button", { name: "Save settings" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Settings saved on this device.",
    );
    first.unmount();
    render(<SettingsBlock />);
    expect(screen.getByLabelText("Workspace name")).toHaveValue("Paper studio");
    await user.type(screen.getByLabelText("Workspace name"), " draft");
    await user.click(screen.getByRole("button", { name: "Discard changes" }));
    expect(screen.getByLabelText("Workspace name")).toHaveValue("Paper studio");
  });

  it("keeps the settings draft when storage fails and allows a retry", async () => {
    const user = userEvent.setup();
    render(<SettingsBlock />);
    await user.type(screen.getByLabelText("Workspace name"), " draft");
    const failure = vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("Quota");
    });
    await user.click(screen.getByRole("button", { name: "Save settings" }));
    expect(screen.getByRole("alert")).toHaveTextContent("could not save");
    expect(screen.getByLabelText("Workspace name")).toHaveValue(
      "Harbour studio draft",
    );
    failure.mockRestore();
    await user.click(screen.getByRole("button", { name: "Save settings" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("filters files, recovers an empty state and downloads the selected content", async () => {
    const user = userEvent.setup();
    render(<FileBrowserBlock />);
    await user.type(screen.getByLabelText("Find a file"), "tokens");
    expect(screen.getByRole("status")).toHaveTextContent("1 of 5");
    expect(
      screen.getByRole("heading", { name: "Tokens.css" }),
    ).toBeInTheDocument();
    const download = screen.getByRole("link", { name: "Download sample file" });
    expect(download).toHaveAttribute("download", "Tokens.css");
    expect(decodeURIComponent(download.getAttribute("href")!)).toContain(
      "--harbour-ink",
    );
    await user.type(screen.getByLabelText("Find a file"), "missing");
    expect(
      screen.getByRole("heading", { name: "No matching files" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByRole("status")).toHaveTextContent("5 of 5");
  });

  it("filters the chart, totals, table and exported CSV with one date window", async () => {
    const user = userEvent.setup();
    render(<AnalyticsBlock />);
    const table = within(
      screen.getByRole("table", { name: "Daily sample readings" }),
    );
    expect(table.getAllByRole("row")).toHaveLength(8);
    await user.click(screen.getByRole("button", { name: "All sample dates" }));
    expect(table.getAllByRole("row")).toHaveLength(22);
    expect(screen.getByText("21 days in view")).toBeInTheDocument();
    const csv = decodeURIComponent(
      screen
        .getByRole("link", { name: "Export current CSV" })
        .getAttribute("href")!,
    );
    expect(csv).toContain("2026-10-01,");
    expect(csv).toContain("2026-10-21,");
    await user.click(screen.getByRole("radio", { name: "Signups" }));
    expect(
      screen.getByRole("group", { name: /^Sample signups\./ }),
    ).toBeInTheDocument();
  });

  it("serves installable blocks and every dependency with source on the current origin", async () => {
    for (const block of BLOCKS) {
      const response = await GET(
        new Request(`http://localhost:3000/r/${block.id}.json`),
        { params: Promise.resolve({ slug: `${block.id}.json` }) },
      );
      expect(response.status).toBe(200);
      const item = await response.json();
      expect(item.type).toBe("registry:block");
      expect(
        item.files.every(
          (file: { content: string }) => file.content.length > 0,
        ),
      ).toBe(true);
      const source = item.files.find((file: { path: string }) =>
        file.path.endsWith(".tsx"),
      ).content as string;
      expect(source).not.toContain("@/mizu");
      expect(source).not.toContain("next/");
      expect(source).toContain(`export function ${block.exportName}`);
      for (const dependency of item.registryDependencies as string[]) {
        expect(dependency).toMatch(
          /^http:\/\/localhost:3000\/r\/[a-z-]+\.json$/,
        );
        const slug = dependency.split("/").at(-1)!;
        const installed = await GET(new Request(dependency), {
          params: Promise.resolve({ slug }),
        });
        expect(installed.status, dependency).toBe(200);
      }
      const registered = registry.items.find(
        (entry) => entry.name === block.id,
      )!;
      expect("registryDependencies" in registered).toBe(true);
      for (const file of registered.files)
        expect(readFileSync(file.path, "utf8")).not.toContain('from "@/');
    }
    expect(
      (
        await GET(new Request("http://localhost:3000/r/unknown.json"), {
          params: Promise.resolve({ slug: "../../.env" }),
        })
      ).status,
    ).toBe(404);
  });
});
