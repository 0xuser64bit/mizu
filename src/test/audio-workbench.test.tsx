import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AudioWorkbench } from "@/components/examples/AudioWorkbench";
import recording from "../../public/audio/interface-field-notes.json";
import { mockLayout } from "./helpers";

let restore: () => void;
beforeEach(() => {
  restore = mockLayout(1000, 360);
});
afterEach(() => {
  restore();
  vi.restoreAllMocks();
});

describe("audio workbench", () => {
  it("ships measured audio peaks and ordered transcript passages inside the recording", () => {
    expect(recording.peaks.length).toBeGreaterThan(1000);
    expect(recording.peaks.every((peak) => peak >= 0 && peak <= 1)).toBe(true);
    expect(recording.peaks.some((peak) => peak > 0.9)).toBe(true);
    expect(recording.chapters[0].start).toBe(0);
    recording.chapters.forEach((chapter, index) => {
      expect(chapter.end).toBeGreaterThan(chapter.start);
      expect(chapter.end).toBeLessThanOrEqual(recording.duration);
      expect(chapter.text.length).toBeGreaterThan(20);
      if (index)
        expect(chapter.start).toBeGreaterThan(
          recording.chapters[index - 1].end,
        );
    });
  });

  it("seeks real media from the transcript and follows actual media time", async () => {
    const user = userEvent.setup();
    const { container } = render(<AudioWorkbench />);
    const audio = container.querySelector("audio")!;
    await user.click(
      screen.getByRole("button", { name: "Seek to Keep the readout still" }),
    );
    expect(audio.currentTime).toBe(recording.chapters[2].start);
    expect(
      screen.getByRole("slider", { name: "Seek Interface field notes" }),
    ).toHaveAttribute("aria-valuenow", "17");
    expect(
      screen.getByRole("button", { name: "Seek to Keep the readout still" }),
    ).toHaveAttribute("aria-current", "true");
    audio.currentTime = 30;
    fireEvent.timeUpdate(audio);
    expect(
      screen.getByRole("button", { name: "Seek to Beyond the ideal moment" }),
    ).toHaveAttribute("aria-current", "true");
  });

  it("selects a transcript passage, plays its range, and stops at its end", async () => {
    const user = userEvent.setup();
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockImplementation(function (this: HTMLMediaElement) {
        fireEvent.play(this);
        return Promise.resolve();
      });
    const pause = vi
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(function (this: HTMLMediaElement) {
        fireEvent.pause(this);
      });
    const { container } = render(<AudioWorkbench />);
    const audio = container.querySelector("audio")!;
    const chapter = recording.chapters[1];
    await user.click(
      screen.getByRole("button", { name: "Select excerpt: Follow the hand" }),
    );
    expect(
      screen.getByRole("button", { name: "Select excerpt: Follow the hand" }),
    ).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Play excerpt" }));
    expect(play).toHaveBeenCalledOnce();
    expect(audio.currentTime).toBe(chapter.start);
    expect(
      screen.getByRole("button", { name: "Pause excerpt" }),
    ).toBeInTheDocument();
    audio.currentTime = chapter.end + 0.2;
    fireEvent.timeUpdate(audio);
    expect(pause).toHaveBeenCalledOnce();
    expect(audio.currentTime).toBe(chapter.end);
    expect(
      screen.getByRole("button", { name: "Play excerpt" }),
    ).toBeInTheDocument();
  });

  it("records an excerpt, edits its outline, and exports the actual notes", async () => {
    const user = userEvent.setup();
    const clipboard = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    render(<AudioWorkbench />);
    await user.click(
      screen.getByRole("button", { name: "Select excerpt: Follow the hand" }),
    );
    await user.click(screen.getByRole("button", { name: "Add excerpt note" }));
    expect(
      within(screen.getByRole("list", { name: "Excerpt notes" })).getAllByRole(
        "button",
      ),
    ).toHaveLength(2);
    const editor = screen.getByRole("region", { name: "Excerpt outline" });
    expect(within(editor).getByRole("textbox")).toHaveFocus();
    await user.type(
      within(editor).getByRole("textbox"),
      "Keep the pause after the question.",
    );
    await user.click(screen.getByRole("button", { name: "Copy notes" }));
    const markdown = clipboard.mock.calls[0][0];
    expect(markdown).toContain("## Excerpt 2 · 0:08.0–0:16.7");
    expect(markdown).toContain("- Keep the pause after the question.");
    expect(markdown).toContain(
      "  - A useful principle to carry into the next interaction study.",
    );
    expect(
      screen.getByText("Notes stay in this tab. Export them before leaving."),
    ).toBeInTheDocument();
  });

  it("restores a deleted excerpt without losing its outline", async () => {
    const user = userEvent.setup();
    render(<AudioWorkbench />);
    await user.click(
      screen.getByRole("button", { name: "Delete excerpt note" }),
    );
    expect(
      screen.getByText(/Your first observation starts here/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download notes" }),
    ).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Undo delete" }));
    expect(
      screen.getByDisplayValue("Keep the readout still."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download notes" }),
    ).toBeEnabled();
  });

  it("explains a playback rejection and keeps notes usable", async () => {
    const user = userEvent.setup();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValue(
      new Error("media unavailable"),
    );
    render(<AudioWorkbench />);
    await user.click(screen.getByRole("button", { name: "Play excerpt" }));
    await act(async () => {});
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Playback could not start.",
    );
    expect(screen.getByRole("button", { name: "Play excerpt" })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Add excerpt note" }),
    ).toBeEnabled();
  });
});
