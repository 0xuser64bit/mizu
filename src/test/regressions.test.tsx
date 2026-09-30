import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Accordion,
  AccordionItem,
  Avatar,
  Button,
  CopyButton,
  Dialog,
  ImageCompare,
  ImageFigure,
  Marquee,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsPanel,
  Tooltip,
} from "@/mizu";

describe("foundation regression gates", () => {
  it("keeps a busy action named and avoids accidental form submission", () => {
    render(<Button loading>Save draft</Button>);
    expect(screen.getByRole("button", { name: /Save draft/ })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
  it("gives repeated tab and disclosure values unique relationships", () => {
    render(
      <>
        {[1, 2].map((n) => (
          <div key={n}>
            <Tabs defaultValue="a">
              <TabsList label={`Group ${n}`}>
                <TabsTrigger value="a">A</TabsTrigger>
              </TabsList>
              <TabsPanel value="a">Panel</TabsPanel>
            </Tabs>
            <Accordion>
              <AccordionItem value="a" title="Question">
                Answer
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </>,
    );
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0].getAttribute("aria-controls")).not.toBe(
      tabs[1].getAttribute("aria-controls"),
    );
    for (const tab of tabs)
      expect(
        document.getElementById(tab.getAttribute("aria-controls")!),
      ).toHaveAttribute("aria-labelledby", tab.id);
    const buttons = screen.getAllByRole("button", { name: "Question" });
    expect(buttons[0].id).not.toBe(buttons[1].id);
  });
  it("skips disabled tabs in keyboard navigation", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="a">
        <TabsList label="Settings">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b" disabled>
            B
          </TabsTrigger>
          <TabsTrigger value="c">C</TabsTrigger>
        </TabsList>
        <TabsPanel value="c">Last</TabsPanel>
      </Tabs>,
    );
    screen.getByRole("tab", { name: "A" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "C" })).toHaveFocus();
  });
  it("keeps native modality in the surrounding theme", () => {
    render(
      <div data-theme="light">
        <Dialog open onOpenChange={() => {}} label="Local">
          Content
        </Dialog>
      </div>,
    );
    expect(
      screen.getByRole("dialog").closest('[data-theme="light"]'),
    ).toBeTruthy();
  });
  it("links the tooltip and dismisses on Escape", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip label="Description">
        <button>Action</button>
      </Tooltip>,
    );
    expect(screen.getByRole("button")).toHaveAccessibleDescription(
      "Description",
    );
    await user.tab();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("tooltip").parentElement).toHaveAttribute(
      "data-dismissed",
      "true",
    );
  });
  it("reports failed clipboard fallback and removes the temporary field", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("Denied")) },
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn(() => false),
    });
    render(<CopyButton text="value">Copy</CopyButton>);
    await user.click(screen.getByRole("button"));
    expect(await screen.findByText("Copy failed. Try again.")).toBeTruthy();
    expect(document.querySelector("textarea")).toBeNull();
  });
  it("lets a caller cancel copying rather than replace it accidentally", () => {
    const writeText = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(
      <CopyButton text="value" onClick={(e) => e.preventDefault()}>
        Copy
      </CopyButton>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(writeText).not.toHaveBeenCalled();
  });
  it("lets keyboard users explicitly pause a moving ticker", async () => {
    const user = userEvent.setup();
    render(
      <Marquee label="Changes">
        <span>Content</span>
      </Marquee>,
    );
    await user.click(screen.getByRole("button", { name: "Pause ticker" }));
    expect(screen.getByRole("button", { name: "Play ticker" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

it("releases the body lock when an outer dialog and its nested dialog unmount together", () => {
  const { unmount } = render(
    <Dialog open onOpenChange={() => {}} label="Outer">
      <Dialog open onOpenChange={() => {}} label="Inner">
        Content
      </Dialog>
    </Dialog>,
  );
  expect(document.body.style.overflow).toBe("hidden");
  unmount();
  expect(document.body.style.overflow).not.toBe("hidden");
});

describe("images that fail before hydration", () => {
  // Server-rendered images start loading before React attaches onError, so a
  // failure there is only visible as a complete image that refuses to decode.
  const proto = HTMLImageElement.prototype;
  const decode = proto.decode;
  afterEach(() => {
    vi.restoreAllMocks();
    proto.decode = decode;
  });
  function loaded(decodes: boolean) {
    vi.spyOn(proto, "complete", "get").mockReturnValue(true);
    vi.spyOn(proto, "naturalWidth", "get").mockReturnValue(0);
    proto.decode = () =>
      decodes ? Promise.resolve() : Promise.reject(new Error("broken"));
  }
  it("show their failure state", async () => {
    loaded(false);
    render(
      <>
        <ImageCompare
          before={{ src: "/a.png", alt: "Before" }}
          after={{ src: "/b.png", alt: "After" }}
          value={50}
          onValueChange={() => {}}
        />
        <Avatar name="Aya Mori" src="/missing.png" />
        <ImageFigure src="/missing.png" alt="Field" loading="eager" />
      </>,
    );
    await waitFor(() =>
      expect(
        screen.getByText("Comparison image unavailable."),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText("AM")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Field" })).toHaveTextContent(
      "Image unavailable",
    );
  });
  it("keep an image that decodes without a natural width, like an unsized SVG", async () => {
    loaded(true);
    render(<Avatar name="Aya Mori" src="/mark.svg" />);
    await Promise.resolve();
    expect(screen.queryByText("AM")).not.toBeInTheDocument();
  });
});
