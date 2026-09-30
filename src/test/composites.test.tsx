import { describe, expect, it, vi } from "vitest";
import {
  render,
  screen,
  act,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { installClipboardMock, reduceMotionQuery } from "./helpers";
import {
  Accordion,
  AccordionItem,
  CopyButton,
  CountUp,
  Dialog,
  DialogTitle,
  GhostWord,
  Specimen,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTrigger,
  ToastProvider,
  useToast,
  WaveText,
} from "@/mizu";

describe("Accordion", () => {
  it("toggles items with aria-expanded", async () => {
    const user = userEvent.setup();
    render(
      <Accordion>
        <AccordionItem value="a" title="First">
          Body A
        </AccordionItem>
        <AccordionItem value="b" title="Second">
          Body B
        </AccordionItem>
      </Accordion>,
    );

    const first = screen.getByRole("button", { name: /first/i });
    expect(first).toHaveAttribute("aria-expanded", "false");
    await user.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Body A")).toBeTruthy();

    await user.click(first);
    expect(first).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the previous item in single mode", async () => {
    const user = userEvent.setup();
    render(
      <Accordion>
        <AccordionItem value="a" title="First">
          Body A
        </AccordionItem>
        <AccordionItem value="b" title="Second">
          Body B
        </AccordionItem>
      </Accordion>,
    );
    await user.click(screen.getByRole("button", { name: /first/i }));
    await user.click(screen.getByRole("button", { name: /second/i }));
    expect(screen.getByRole("button", { name: /first/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByRole("button", { name: /second/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("allows multiple when allowMultiple is set", async () => {
    const user = userEvent.setup();
    render(
      <Accordion allowMultiple>
        <AccordionItem value="a" title="First">
          Body A
        </AccordionItem>
        <AccordionItem value="b" title="Second">
          Body B
        </AccordionItem>
      </Accordion>,
    );
    await user.click(screen.getByRole("button", { name: /first/i }));
    await user.click(screen.getByRole("button", { name: /second/i }));
    expect(screen.getByRole("button", { name: /first/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("button", { name: /second/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});

describe("Tabs", () => {
  it("switches panels on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="a">
        <TabsList label="Settings">
          <TabsTrigger value="a">General</TabsTrigger>
          <TabsTrigger value="b">Advanced</TabsTrigger>
        </TabsList>
        <TabsPanel value="a">Panel A</TabsPanel>
        <TabsPanel value="b">Panel B</TabsPanel>
      </Tabs>,
    );
    expect(screen.getByText("Panel A")).toBeTruthy();
    await user.click(screen.getByRole("tab", { name: /advanced/i }));
    expect(screen.getByText("Panel B")).toBeTruthy();
    expect(screen.queryByText("Panel A")).toBeNull();
  });

  it("supports controlled value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Tabs value="a" onChange={onChange}>
        <TabsList label="Settings">
          <TabsTrigger value="a">General</TabsTrigger>
          <TabsTrigger value="b">Advanced</TabsTrigger>
        </TabsList>
        <TabsPanel value="a">Panel A</TabsPanel>
        <TabsPanel value="b">Panel B</TabsPanel>
      </Tabs>,
    );
    await user.click(screen.getByRole("tab", { name: /advanced/i }));
    expect(onChange).toHaveBeenCalledWith("b");
    expect(screen.getByText("Panel A")).toBeTruthy();
  });

  it("moves between triggers with arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="a">
        <TabsList label="Settings">
          <TabsTrigger value="a">General</TabsTrigger>
          <TabsTrigger value="b">Advanced</TabsTrigger>
          <TabsTrigger value="c">Extras</TabsTrigger>
        </TabsList>
        <TabsPanel value="a">Panel A</TabsPanel>
        <TabsPanel value="b">Panel B</TabsPanel>
        <TabsPanel value="c">Panel C</TabsPanel>
      </Tabs>,
    );
    const general = screen.getByRole("tab", { name: /general/i });
    const advanced = screen.getByRole("tab", { name: /advanced/i });
    const extras = screen.getByRole("tab", { name: /extras/i });

    general.focus();
    await user.keyboard("{ArrowRight}");
    expect(advanced).toHaveFocus();
    expect(screen.getByText("Panel B")).toBeTruthy();

    await user.keyboard("{ArrowLeft}");
    expect(general).toHaveFocus();
    expect(screen.getByText("Panel A")).toBeTruthy();

    await user.keyboard("{End}");
    expect(extras).toHaveFocus();

    await user.keyboard("{Home}");
    expect(general).toHaveFocus();
  });
});

describe("Dialog", () => {
  it("opens with focus inside the dialog", () => {
    render(
      <Dialog open={true} onOpenChange={() => {}} label="Test dialog">
        <DialogTitle>Title</DialogTitle>
        <button>Inside</button>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog", { name: "Test dialog" });
    expect(dialog).toBeTruthy();
    expect(screen.getByText("Title")).toBeTruthy();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("closes on Escape", async () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open={true} onOpenChange={onOpenChange} label="Test dialog">
        <DialogTitle>Title</DialogTitle>
      </Dialog>,
    );
    fireEvent(
      screen.getByRole("dialog"),
      new Event("cancel", { cancelable: true }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("restores focus and scroll state after close", () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    document.body.style.overflow = "auto";
    const { rerender } = render(
      <Dialog open onOpenChange={() => {}} label="Test">
        <button>Inside</button>
      </Dialog>,
    );
    expect(document.body.style.overflow).toBe("hidden");
    rerender(
      <Dialog open={false} onOpenChange={() => {}} label="Test">
        <button>Inside</button>
      </Dialog>,
    );
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("auto");
    trigger.remove();
    document.body.style.overflow = "";
  });
});

describe("CountUp", () => {
  it("animates toward the target value", async () => {
    reduceMotionQuery.matches = false;
    reduceMotionQuery.dispatchEvent();
    vi.useFakeTimers();
    try {
      const { rerender } = render(<CountUp value={100} duration={1} />);
      expect(screen.getByText("0")).toBeTruthy();
      rerender(<CountUp value={200} duration={1} />);
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.getByText(/1\d\d/)).toBeTruthy();
      await act(async () => {
        vi.advanceTimersByTime(700);
      });
      expect(
        screen.getByText("200", { selector: "span[aria-hidden=true]" }),
      ).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("sets the value instantly under reduced motion", () => {
    render(<CountUp value={42} duration={1} />);
    expect(screen.getByText("42")).toBeTruthy();
  });
});

describe("CopyButton", () => {
  it("copies text and shows confirmation", async () => {
    const user = userEvent.setup();
    installClipboardMock();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      configurable: true,
      value: { writeText },
    });
    render(<CopyButton text="#ff4d1c">#ff4d1c</CopyButton>);
    await user.click(screen.getByRole("button"));
    expect(writeText).toHaveBeenCalledWith("#ff4d1c");
    expect(await screen.findByText("Copied")).toBeTruthy();
  });
});

describe("Toast", () => {
  it("renders toasts and auto-dismisses", async () => {
    function Probe() {
      const { toast } = useToast();
      return (
        <button
          onClick={() => toast("Saved", { tone: "success", duration: 300 })}
        >
          save
        </button>
      );
    }
    render(
      <ToastProvider>
        <Probe />
      </ToastProvider>,
    );
    act(() => {
      screen.getByRole("button", { name: "save" }).click();
    });
    expect(screen.getByText("Saved")).toBeTruthy();

    await waitFor(() => expect(screen.queryByText("Saved")).toBeNull(), {
      timeout: 3000,
    });
    expect(screen.queryByText("Saved")).toBeNull();
  });
});

describe("Specimen", () => {
  it("updates the stage when controlled text changes", () => {
    const { rerender } = render(<Specimen text="Mizu" />);
    expect(screen.getByText("Mizu")).toBeTruthy();
    rerender(<Specimen text="Kilo" />);
    expect(screen.getByText("Kilo")).toBeTruthy();
  });

  it("shows placeholder for empty text", () => {
    render(<Specimen text="" />);
    expect(screen.getByText("Type")).toBeTruthy();
  });
});

describe("type systems", () => {
  it("WaveText exposes the full word as its accessible name", () => {
    render(<WaveText text="Mizu" />);
    expect(screen.getByLabelText("Mizu")).toBeTruthy();
  });

  it("WaveText leaves color to CSS, so a theme switch reaches its letters", () => {
    // Motion resolves var() in a value it computes, freezing the mount theme's paper.
    const { container } = render(
      <>
        <WaveText text="Mizu" />
        <WaveText text="Ink" colorFrom="red" colorTo="blue" />
      </>,
    );
    for (const letter of container.querySelectorAll<HTMLElement>(
      ".mizu-wave-text > span > span",
    ))
      expect(letter.style.color).toBe("");
    const [plain, colored] =
      container.querySelectorAll<HTMLElement>(".mizu-wave-text");
    expect(plain!.getAttribute("style")).toBeNull();
    expect(colored!.style.getPropertyValue("--mizu-wave-from")).toBe("red");
    expect(colored!.style.getPropertyValue("--mizu-wave-to")).toBe("blue");
  });

  it("GhostWord renders its text", () => {
    render(<GhostWord text="MIZU." />);
    expect(screen.getByText("MIZU.")).toBeTruthy();
  });

  it("GhostWord is display-sized unless told otherwise", () => {
    // happy-dom drops clamp() from the DOM; the server markup keeps it.
    expect(renderToStaticMarkup(<GhostWord text="Big" />)).toContain(
      "font-size:clamp(4rem, 12vw, 9rem)",
    );
    render(<GhostWord text="Small" size="inherit" />);
    expect(screen.getByText("Small").style.fontSize).toBe("inherit");
  });
});

it("keeps invalid counters readable without locale-formatting exceptions", () => {
  const { container } = render(<CountUp value={NaN} decimals={Infinity} />);
  expect(container).toHaveTextContent("—");
});
