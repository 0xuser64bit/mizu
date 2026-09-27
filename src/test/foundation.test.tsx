import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Badge,
  Button,
  Frame,
  Mark,
  Rule,
  SectionTag,
  Slider,
  Spinner,
  Tooltip,
} from "@/mizu";

describe("Button", () => {
  it("renders children and fires onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Continue</Button>);
    const btn = screen.getByRole("button", { name: /continue/i });
    await user.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("applies variant classes", () => {
    const { container } = render(<Button variant="ghost">Go</Button>);
    expect(container.querySelector(".mizu-btn--ghost")).toBeTruthy();
  });

  it("disables and shows spinner when loading", () => {
    render(<Button loading>Saving</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("respects disabled prop", () => {
    render(<Button disabled>No</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

describe("primitives", () => {
  it("Mark renders a rotated diamond", () => {
    const { container } = render(<Mark size={8} />);
    const mark = container.querySelector("span")!;
    expect(mark.style.transform).toContain("rotate(45deg)");
    expect(mark.style.background).toContain("--mizu-accent");
  });

  it("SectionTag shows text and diamond by default", () => {
    render(<SectionTag>Hello</SectionTag>);
    expect(screen.getByText("Hello")).toBeTruthy();
  });

  it("Badge applies tone", () => {
    const { container } = render(<Badge tone="accent">Live</Badge>);
    expect(container.querySelector("span")!.style.color).toContain(
      "--mizu-accent",
    );
    expect(screen.getByText("Live")).toBeTruthy();
  });

  it("Rule renders label and separator semantics", () => {
    render(<Rule label="Interlude" />);
    expect(screen.getByText("Interlude")).toBeTruthy();
    expect(screen.getByRole("separator")).toBeTruthy();
  });

  it("Spinner has role status and label", () => {
    render(<Spinner label="Working" />);
    expect(screen.getByRole("status")).toHaveAccessibleName("Working");
  });

  it("Frame renders label plate and children", () => {
    render(
      <Frame label="Fig. 01">
        <p>content</p>
      </Frame>,
    );
    expect(screen.getByText("Fig. 01")).toBeTruthy();
    expect(screen.getByText("content")).toBeTruthy();
  });

  it("Slider reports changes through onChange", () => {
    const onChange = vi.fn();
    render(
      <Slider label="Size" value={50} min={0} max={100} onChange={onChange} />,
    );
    const input = screen.getByLabelText("Size");
    fireEvent.change(input, { target: { value: "75" } });
    expect(onChange).toHaveBeenCalledWith(75);
  });

  it("renders a labelled tooltip bubble, hidden until hover/focus", () => {
    render(
      <Tooltip label="More info">
        <button>Hover</button>
      </Tooltip>,
    );
    const tip = screen.getByRole("tooltip");
    expect(tip).toHaveTextContent("More info");
    expect(tip.className).toContain("mizu-tooltip-bubble");
  });
});
