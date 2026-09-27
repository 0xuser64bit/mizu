import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRef } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  FlowGraph,
  Plane,
  PlaneItem,
  tidyFlow,
  type FlowEdge,
  type FlowNode,
  type PlaneHandle,
} from "@/mizu";
import { mockLayout } from "./helpers";

let restore: () => void;
beforeEach(() => {
  restore = mockLayout(800, 500);
});
afterEach(() => restore());

describe("Plane", () => {
  it("zooms and travels from the keyboard and reports the camera", async () => {
    const view = vi.fn();
    render(
      <Plane
        label="Board"
        defaultView={{ x: 0, y: 0, zoom: 1 }}
        onViewChange={view}
      >
        <PlaneItem id="a" x={0} y={0} width={100} height={60} label="Card A" />
      </Plane>,
    );
    const canvas = screen.getByRole("group", { name: "Board, 100%" });
    fireEvent.keyDown(canvas, { key: "+" });
    expect(view.mock.lastCall![0].zoom).toBeCloseTo(1.4);
    fireEvent.keyDown(canvas, { key: "ArrowRight" });
    expect(view.mock.lastCall![0].x).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: "Reset zoom to 100%" }),
    ).toHaveTextContent("140%");
  });

  it("nudges draggable items with arrow keys and exposes a camera handle", async () => {
    const move = vi.fn(),
      view = vi.fn();
    const plane = createRef<PlaneHandle>();
    render(
      <Plane
        ref={plane}
        label="Board"
        defaultView={{ x: 0, y: 0, zoom: 1 }}
        onViewChange={view}
      >
        <PlaneItem
          id="a"
          x={10}
          y={20}
          width={100}
          height={60}
          label="Card A"
          onMove={move}
        />
        <PlaneItem
          id="b"
          x={900}
          y={700}
          width={100}
          height={60}
          label="Card B"
        />
      </Plane>,
    );
    fireEvent.keyDown(screen.getByRole("group", { name: "Card A" }), {
      key: "ArrowRight",
    });
    expect(move).toHaveBeenLastCalledWith(18, 20);
    fireEvent.keyDown(screen.getByRole("group", { name: "Card A" }), {
      key: "ArrowDown",
      shiftKey: true,
    });
    expect(move).toHaveBeenLastCalledWith(10, 68);
    await act(async () => {
      await new Promise((r) => requestAnimationFrame(r));
    });
    act(() => plane.current!.fit());
    const { x, y, zoom } = view.mock.lastCall![0];
    expect(x).toBeCloseTo(505);
    expect(y).toBeCloseTo(390);
    expect(zoom).toBeLessThan(1);
  });
});

const NODES: FlowNode[] = [
  { id: "a", x: 0, y: 0, label: "Form submitted", kind: "Trigger", inputs: [] },
  { id: "b", x: 300, y: 0, label: "Is urgent?", outputs: ["yes", "no"] },
  { id: "c", x: 600, y: -100, label: "Page on-call", outputs: [] },
  { id: "d", x: 600, y: 100, label: "Create ticket", outputs: [] },
];
const EDGES: FlowEdge[] = [
  { id: "ab", source: "a", target: "b" },
  { id: "bc", source: "b", sourcePort: "yes", target: "c" },
];

describe("FlowGraph", () => {
  it("describes what each node receives and sends", () => {
    render(<FlowGraph label="Intake" nodes={NODES} edges={EDGES} />);
    const node = screen.getByRole("group", { name: "Is urgent?" });
    expect(node).toHaveAccessibleDescription(
      "Receives from Form submitted. Sends to Page on-call.",
    );
    expect(
      screen.getByRole("button", {
        name: "Connection from Form submitted to Is urgent?",
      }),
    ).toBeInTheDocument();
  });

  it("wires from the keyboard, refuses what validation rejects and announces the result", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <FlowGraph
        label="Intake"
        nodes={NODES}
        edges={EDGES}
        onEdgesChange={change}
        validateConnection={(e) =>
          e.target !== "a" || "Triggers accept no input."
        }
      />,
    );
    const no = screen.getByRole("button", {
      name: "Is urgent? output no, start a connection",
    });
    no.focus();
    await user.keyboard("{Enter}");
    const ticket = screen.getByRole("button", {
      name: "Create ticket input in, connect here",
    });
    expect(ticket).toHaveAttribute("tabindex", "0");
    await user.click(ticket);
    expect(change).toHaveBeenLastCalledWith([
      ...EDGES,
      expect.objectContaining({
        source: "b",
        sourcePort: "no",
        target: "d",
        targetPort: "in",
      }),
    ]);
    no.focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{Escape}");
    expect(
      screen.queryByRole("button", { name: /connect here/ }),
    ).not.toBeInTheDocument();
  });

  it("refuses loops back to itself and duplicate wires", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <FlowGraph
        label="Intake"
        nodes={NODES}
        edges={EDGES}
        onEdgesChange={change}
      />,
    );
    screen
      .getByRole("button", {
        name: "Form submitted output out, start a connection",
      })
      .focus();
    await user.keyboard("{Enter}");
    await user.click(
      screen.getByRole("button", { name: /Is urgent\? input in/ }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Those ports are already connected.",
    );
    expect(change).not.toHaveBeenCalled();
  });

  it("removes a selected node with its connections", async () => {
    const nodes = vi.fn(),
      edges = vi.fn();
    render(
      <FlowGraph
        label="Intake"
        nodes={NODES}
        edges={EDGES}
        onNodesChange={nodes}
        onEdgesChange={edges}
        defaultSelected="b"
      />,
    );
    fireEvent.keyDown(screen.getByRole("group", { name: "Is urgent?" }), {
      key: "Delete",
    });
    expect(nodes).toHaveBeenLastCalledWith(NODES.filter((n) => n.id !== "b"));
    expect(edges).toHaveBeenLastCalledWith([]);
  });

  it("tidies into layers that follow the wires", () => {
    const tidy = tidyFlow(
      NODES.map((n) => ({ ...n, x: 0, y: 0 })),
      [...EDGES, { id: "bd", source: "b", sourcePort: "no", target: "d" }],
    );
    const at = Object.fromEntries(tidy.map((n) => [n.id, n]));
    expect(at.a!.x).toBeLessThan(at.b!.x);
    expect(at.b!.x).toBeLessThan(at.c!.x);
    expect(at.c!.x).toBe(at.d!.x);
    expect(at.c!.y).not.toBe(at.d!.y);
  });
});
