import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRef, useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Interview,
  Tour,
  TransferQueue,
  TriageDeck,
  type InterviewQuestion,
  type TourStep,
  type TransferFunction,
  type TransferQueueHandle,
  type TriageDecision,
} from "@/mizu";
import { mockLayout } from "./helpers";

const STEPS: TourStep[] = [
  { target: "#one", title: "First thing", body: "Where it starts." },
  { target: "#two", title: "Second thing", body: "Where it continues." },
  { target: "#nowhere", title: "Hidden thing", body: "Not on this page." },
];

function Harness({ onFinish }: { onFinish?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button id="one" type="button" onClick={() => setOpen(true)}>
        Start
      </button>
      <p id="two">Target two</p>
      <Tour
        steps={STEPS}
        open={open}
        onOpenChange={setOpen}
        onFinish={onFinish}
        label="Welcome"
      />
    </>
  );
}

describe("Tour", () => {
  let restore: () => void;
  beforeEach(() => {
    restore = mockLayout(200, 40);
  });
  afterEach(() => restore());
  const closed = () =>
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();

  it("steps through as a modal dialog, announcing each step", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(
      screen.getByRole("dialog", { name: "First thing" }),
    ).toHaveAccessibleDescription("Where it starts.");
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(
      screen.getByRole("dialog", { name: "Second thing" }),
    ).toBeInTheDocument();
    await act(
      () => new Promise((r) => requestAnimationFrame(() => r(undefined))),
    );
    expect(screen.getByText("Step 2 of 3: Second thing")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(
      screen.getByRole("dialog", { name: "First thing" }),
    ).toBeInTheDocument();
  });

  it("explains a missing element and finishes on the last step", async () => {
    const user = userEvent.setup(),
      finish = vi.fn();
    render(<Harness onFinish={finish} />);
    await user.click(screen.getByRole("button", { name: "Start" }));
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(screen.getByText(/isn’t showing right now/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Finish" }));
    expect(finish).toHaveBeenCalledTimes(1);
    closed();
    expect(screen.getByRole("button", { name: "Start" })).toHaveFocus();
  });

  it("leaves on Skip or Escape without finishing", async () => {
    const user = userEvent.setup(),
      finish = vi.fn();
    render(<Harness onFinish={finish} />);
    await user.click(screen.getByRole("button", { name: "Start" }));
    await user.click(screen.getByRole("button", { name: "Skip tour" }));
    closed();
    await user.click(screen.getByRole("button", { name: "Start" }));
    // happy-dom does not turn Escape into the native dialog's cancel event.
    fireEvent(
      screen.getByRole("dialog"),
      new Event("cancel", { cancelable: true }),
    );
    closed();
    expect(finish).not.toHaveBeenCalled();
  });
});

const QS: InterviewQuestion[] = [
  { id: "name", title: "Your name?", type: "text", required: true },
  {
    id: "role",
    title: "Your role?",
    type: "choice",
    required: true,
    options: [
      { value: "design", label: "Design" },
      { value: "code", label: "Engineering" },
    ],
  },
  {
    id: "system",
    title: "Keep a system?",
    type: "yesno",
    next: (a) => (a.system ? "which" : "score"),
  },
  { id: "which", title: "Which system?", type: "text" },
  { id: "score", title: "Score?", type: "scale", min: 1, max: 5 },
];

describe("Interview", () => {
  it("asks one question at a time, refuses empty required answers and branches", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <Interview
        label="Onboarding"
        questions={QS}
        onAnswersChange={change}
        onSubmit={() => {}}
      />,
    );
    await user.keyboard("{Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "This one needs an answer to continue.",
    );
    await user.type(
      screen.getByRole("textbox", { name: /Your name/ }),
      "Rin{Enter}",
    );
    expect(
      await screen.findByRole("radiogroup", { name: /Your role/ }),
    ).toBeInTheDocument();
    await user.keyboard("b");
    expect(
      await screen.findByRole("heading", { name: "Keep a system?" }),
    ).toBeInTheDocument();
    await user.keyboard("n");
    expect(
      await screen.findByRole("heading", { name: "Score?" }),
    ).toBeInTheDocument();
    expect(change).toHaveBeenLastCalledWith({
      name: "Rin",
      role: "code",
      system: false,
    });
  });

  it("reviews, edits, and retries a failed send without losing answers", async () => {
    const user = userEvent.setup();
    const submit = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined);
    render(
      <Interview
        label="Onboarding"
        questions={QS}
        defaultAnswers={{
          name: "Rin",
          role: "design",
          system: true,
          which: "Mizu",
          score: 4,
        }}
        onSubmit={submit}
        done="All set."
      />,
    );
    for (let i = 0; i < 5; i++)
      await user.click(screen.getByRole("button", { name: /Next|Review/ }));
    expect(
      screen.getByRole("heading", { name: "Before you send" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mizu")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Edit: Your role?" }));
    expect(await screen.findByRole("radio", { name: /Design/ })).toBeChecked();
    for (let i = 0; i < 4; i++)
      await user.click(screen.getByRole("button", { name: /Next|Review/ }));
    await user.click(screen.getByRole("button", { name: /Send answers/ }));
    expect(await screen.findByText(/Sending didn’t work/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Try again/ }));
    expect(await screen.findByText("All set.")).toBeInTheDocument();
    expect(submit).toHaveBeenLastCalledWith({
      name: "Rin",
      role: "design",
      system: true,
      which: "Mizu",
      score: 4,
    });
  });
});

describe("TransferQueue", () => {
  type Pending = {
    file: File;
    signal: AbortSignal;
    progress: (n: number) => void;
    resolve: () => void;
    reject: (e: Error) => void;
  };
  const setup = () => {
    const calls: Pending[] = [];
    const transfer: TransferFunction = (file, { signal, onProgress }) =>
      new Promise<void>((resolve, reject) =>
        calls.push({ file, signal, progress: onProgress, resolve, reject }),
      );
    const handle = createRef<TransferQueueHandle>();
    const complete = vi.fn();
    render(
      <TransferQueue
        ref={handle}
        label="Uploads"
        transfer={transfer}
        concurrency={2}
        onComplete={complete}
      />,
    );
    const files = ["a.png", "b.zip", "c.pdf"].map(
      (n) => new File(["x".repeat(100)], n),
    );
    return { calls, handle, complete, files };
  };
  const frame = () => act(() => new Promise((r) => setTimeout(r, 40)));

  it("runs at most `concurrency` transfers and reports progress and completion", async () => {
    const { calls, handle, complete, files } = setup();
    act(() => handle.current!.add(files));
    await frame();
    expect(calls).toHaveLength(2);
    expect(screen.getByText("Waiting")).toBeInTheDocument();
    act(() => calls[0]!.progress(50));
    await frame();
    expect(screen.getByRole("progressbar", { name: "a.png" })).toHaveAttribute(
      "aria-valuenow",
      "50",
    );
    await act(async () => calls[0]!.resolve());
    await frame();
    expect(complete).toHaveBeenCalledWith(
      expect.objectContaining({ status: "done" }),
    );
    expect(calls).toHaveLength(3);
    expect(
      screen.getByRole("button", { name: "Clear a.png" }),
    ).toBeInTheDocument();
  });

  it("pauses by aborting, resumes by restarting, retries failures and cancels", async () => {
    const user = userEvent.setup();
    const { calls, handle, files } = setup();
    act(() => handle.current!.add(files.slice(0, 2)));
    await frame();
    await user.click(screen.getByRole("button", { name: "Pause a.png" }));
    expect(calls[0]!.signal.aborted).toBe(true);
    expect(screen.getByText("Paused at 0%")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Resume a.png" }));
    await frame();
    expect(calls).toHaveLength(3);
    await act(async () => calls[1]!.reject(new Error("Server said no")));
    await frame();
    expect(screen.getByRole("alert")).toHaveTextContent("Server said no");
    await user.click(screen.getByRole("button", { name: "Retry b.zip" }));
    await frame();
    expect(calls).toHaveLength(4);
    await user.click(screen.getByRole("button", { name: "Cancel b.zip" }));
    expect(calls[3]!.signal.aborted).toBe(true);
    expect(screen.queryByText("b.zip")).not.toBeInTheDocument();
  });
});

describe("TriageDeck", () => {
  const ITEMS = [
    { id: "a", title: "Invoice" },
    { id: "b", title: "Offsite" },
  ];
  const DECISIONS: TriageDecision[] = [
    { id: "archive", label: "Archive", direction: "left" },
    { id: "keep", label: "Keep", direction: "right", tone: "success" },
  ];
  it("decides with keys and buttons, keeps tallies and undoes", async () => {
    const user = userEvent.setup(),
      decide = vi.fn(),
      undo = vi.fn();
    render(
      <TriageDeck
        label="Inbox"
        items={ITEMS}
        itemLabel={(i) => i.title}
        decisions={DECISIONS}
        onDecide={decide}
        onUndo={undo}
        renderItem={(i) => <p>{i.title}</p>}
        empty="All clear."
      />,
    );
    const deck = screen.getByRole("group", { name: "Invoice, item 1 of 2" });
    deck.focus();
    await user.keyboard("{ArrowRight}");
    expect(decide).toHaveBeenLastCalledWith(ITEMS[0], DECISIONS[1]);
    expect(
      screen.getByRole("group", { name: "Offsite, item 2 of 2" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "Decisions so far" }),
    ).toHaveTextContent("Keep 1");
    await user.click(screen.getByRole("button", { name: /Archive/ }));
    expect(decide).toHaveBeenLastCalledWith(ITEMS[1], DECISIONS[0]);
    expect(screen.getByText("All clear.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Archive/ })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(undo).toHaveBeenLastCalledWith(ITEMS[1], DECISIONS[0]);
    expect(
      screen.getByRole("group", { name: "Offsite, item 2 of 2" }),
    ).toBeInTheDocument();
    await act(
      () => new Promise((r) => requestAnimationFrame(() => r(undefined))),
    );
    expect(screen.getByText("Undid Archive on Offsite.")).toBeInTheDocument();
  });
});
