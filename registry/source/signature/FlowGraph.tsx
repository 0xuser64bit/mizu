"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "../motion/Preferences";
import { Plane, PlaneItem, type PlaneHandle } from "./Plane";
import { useAnnouncer, useControllable, useTween } from "./internal";
import {
  FOOT,
  GRID,
  HEAD,
  ROW,
  ins,
  outs,
  rows,
  tidyFlow,
  type FlowEdge,
  type FlowNode,
} from "./flow";

export {
  tidyFlow,
  type FlowStatus,
  type FlowNode,
  type FlowEdge,
} from "./flow";

function port(
  n: FlowNode,
  side: "in" | "out",
  name: string | undefined,
  width: number,
) {
  const list = side === "in" ? ins(n) : outs(n);
  const i = Math.max(0, name === undefined ? 0 : list.indexOf(name));
  return {
    x: n.x + (side === "out" ? width : 0),
    y: n.y + HEAD + i * ROW + ROW / 2,
  };
}
function curve(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = Math.max(56, Math.abs(b.x - a.x) * 0.5);
  return `M${a.x},${a.y}C${a.x + dx},${a.y} ${b.x - dx},${b.y} ${b.x},${b.y}`;
}

/**
 * A node-and-wire editor on a Plane: drag nodes, wire outputs to inputs with
 * magnetic snapping or the keyboard, watch run status flow along the wires,
 * and tidy the whole graph into layers.
 */
export function FlowGraph({
  label,
  nodes: nodesProp,
  defaultNodes = [],
  onNodesChange,
  edges: edgesProp,
  defaultEdges = [],
  onEdgesChange,
  readOnly = false,
  selected,
  defaultSelected = null,
  onSelectedChange,
  validateConnection,
  renderNode,
  nodeWidth = 232,
  tools,
  className = "",
  style,
}: {
  label: string;
  nodes?: readonly FlowNode[];
  defaultNodes?: readonly FlowNode[];
  /** Receives moved, tidied and deleted nodes. */
  onNodesChange?: (nodes: FlowNode[]) => void;
  edges?: readonly FlowEdge[];
  defaultEdges?: readonly FlowEdge[];
  /** Receives new and deleted connections. */
  onEdgesChange?: (edges: FlowEdge[]) => void;
  /** Watch only: no dragging, wiring, tidying or deleting. */
  readOnly?: boolean;
  selected?: string | null;
  defaultSelected?: string | null;
  onSelectedChange?: (id: string | null) => void;
  /** Return false or a reason to refuse a connection. */
  validateConnection?: (edge: FlowEdge) => boolean | string;
  /** Replaces the default caption, title and description of a node. */
  renderNode?: (node: FlowNode) => ReactNode;
  nodeWidth?: number;
  tools?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const plane = useRef<PlaneHandle>(null);
  const [message, announce] = useAnnouncer();
  const [tween] = useTween();
  const [nodes, setNodes] = useControllable<readonly FlowNode[]>(
    nodesProp,
    defaultNodes,
    onNodesChange && ((next) => onNodesChange(next as FlowNode[])),
  );
  const [edges, setEdges] = useControllable<readonly FlowEdge[]>(
    edgesProp,
    defaultEdges,
    onEdgesChange && ((next) => onEdgesChange(next as FlowEdge[])),
  );
  const [choice, setChoice] = useControllable<string | null>(
    selected,
    defaultSelected,
    onSelectedChange,
  );
  const [override, setOverride] = useState<Map<
    string,
    { x: number; y: number }
  > | null>(null);
  const [wire, setWire] = useState<{
    node: string;
    port: string;
    to?: { x: number; y: number };
    snap?: string;
  } | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const refusalTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(refusalTimer.current), []);

  const shown = useMemo(
    () =>
      override ? nodes.map((n) => ({ ...n, ...override.get(n.id) })) : nodes,
    [nodes, override],
  );
  const byId = useMemo(() => new Map(shown.map((n) => [n.id, n])), [shown]);
  const editable = !readOnly;

  const refuse = (reason: string) => {
    setRefusal(reason);
    window.clearTimeout(refusalTimer.current);
    refusalTimer.current = window.setTimeout(() => setRefusal(null), 2400);
  };
  const connect = (
    source: { node: string; port: string },
    target: { node: string; port: string },
  ) => {
    setWire(null);
    if (!editable) return;
    const edge: FlowEdge = {
      id: `${source.node}.${source.port}->${target.node}.${target.port}`,
      source: source.node,
      sourcePort: source.port,
      target: target.node,
      targetPort: target.port,
    };
    if (source.node === target.node)
      return refuse("A node cannot connect to itself.");
    if (
      edges.some(
        (e) =>
          e.source === edge.source &&
          (e.sourcePort ?? outs(byId.get(e.source)!)[0]) === edge.sourcePort &&
          e.target === edge.target &&
          (e.targetPort ?? ins(byId.get(e.target)!)[0]) === edge.targetPort,
      )
    )
      return refuse("Those ports are already connected.");
    const verdict = validateConnection?.(edge) ?? true;
    if (verdict !== true)
      return refuse(
        typeof verdict === "string"
          ? verdict
          : "That connection is not allowed.",
      );
    setEdges([...edges, edge]);
    const from = byId.get(source.node)!,
      to = byId.get(target.node)!;
    announce(`Connected ${from.label} to ${to.label}.`);
  };
  const remove = (target: string) => {
    if (!editable) return;
    if (byId.has(target)) {
      const node = byId.get(target)!;
      setNodes(nodes.filter((n) => n.id !== target));
      setEdges(edges.filter((e) => e.source !== target && e.target !== target));
      announce(`Removed ${node.label}.`);
    } else {
      setEdges(edges.filter((e) => e.id !== target));
      announce("Connection removed.");
    }
    setChoice(null);
  };
  const tidy = () => {
    if (!editable) return;
    const next = tidyFlow(nodes, edges, nodeWidth);
    const from = new Map(nodes.map((n) => [n.id, { x: n.x, y: n.y }]));
    tween(
      reduce ? 0 : 720,
      (t) =>
        setOverride(
          new Map(
            next.map((n) => {
              const a = from.get(n.id)!;
              return [
                n.id,
                { x: a.x + (n.x - a.x) * t, y: a.y + (n.y - a.y) * t },
              ];
            }),
          ),
        ),
      () => {
        setOverride(null);
        setNodes(next);
        requestAnimationFrame(() => plane.current?.fit());
      },
    );
    announce("Arranged into layers.");
  };

  // Pointer wiring: follow the pointer and snap to the nearest compatible input within reach.
  const startWire = (node: string, portName: string, e: React.PointerEvent) => {
    if (!editable || e.button !== 0) return;
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setWire({
      node,
      port: portName,
      to: plane.current?.toWorld(e.clientX, e.clientY),
    });
  };
  const moveWire = (e: React.PointerEvent) => {
    if (!wire?.to) return;
    const to = plane.current!.toWorld(e.clientX, e.clientY);
    let snap: string | undefined,
      best = 28;
    for (const n of shown) {
      if (n.id === wire.node) continue;
      for (const p of ins(n)) {
        const at = port(n, "in", p, nodeWidth);
        const d = Math.hypot(at.x - to.x, at.y - to.y);
        if (d < best) {
          best = d;
          snap = `${n.id}\u0000${p}`;
        }
      }
    }
    setWire({ ...wire, to, snap });
  };
  const endWire = () => {
    if (!wire?.to) return;
    if (wire.snap) {
      const [node, portName] = wire.snap.split("\u0000") as [string, string];
      connect({ node: wire.node, port: wire.port }, { node, port: portName });
    } else setWire(null);
  };

  const onGraphKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && wire) {
      e.preventDefault();
      setWire(null);
      announce("Connection cancelled.");
    } else if (
      (e.key === "Delete" || e.key === "Backspace") &&
      choice &&
      !(e.target as HTMLElement).closest("input, textarea")
    ) {
      e.preventDefault();
      remove(choice);
    }
  };

  const wireFrom = wire && byId.get(wire.node);
  const snapTarget = wire?.snap?.split("\u0000");
  const wirePath =
    wireFrom &&
    wire.to &&
    curve(
      port(wireFrom, "out", wire.port, nodeWidth),
      snapTarget
        ? port(byId.get(snapTarget[0]!)!, "in", snapTarget[1], nodeWidth)
        : wire.to,
    );

  return (
    <div
      className={`mizu-flow ${className}`}
      style={style}
      data-wiring={wire ? "" : undefined}
      onKeyDown={onGraphKey}
      onPointerMove={moveWire}
      onPointerUp={endWire}
    >
      <Plane
        ref={plane}
        label={label}
        grid="dots"
        onBackgroundPointerDown={() => {
          setChoice(null);
          setWire(null);
        }}
        tools={
          <>
            {editable && (
              <button type="button" onClick={tidy} disabled={nodes.length < 2}>
                Tidy
              </button>
            )}
            {tools}
          </>
        }
      >
        <svg className="mizu-flow-wires" width="1" height="1">
          {edges.map((edge) => {
            const a = byId.get(edge.source),
              b = byId.get(edge.target);
            if (!a || !b) return null;
            const d = curve(
              port(a, "out", edge.sourcePort, nodeWidth),
              port(b, "in", edge.targetPort, nodeWidth),
            );
            const mid = {
              x: (a.x + nodeWidth + b.x) / 2,
              y:
                (port(a, "out", edge.sourcePort, nodeWidth).y +
                  port(b, "in", edge.targetPort, nodeWidth).y) /
                2,
            };
            return (
              <g
                key={edge.id}
                className="mizu-flow-wire"
                data-status={a.status ?? "idle"}
                data-selected={choice === edge.id || undefined}
                role="button"
                tabIndex={0}
                aria-label={`Connection from ${a.label} to ${b.label}${edge.label ? `, ${edge.label}` : ""}`}
                aria-pressed={choice === edge.id}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setChoice(edge.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setChoice(choice === edge.id ? null : edge.id);
                  }
                }}
              >
                <path className="mizu-flow-wire-hit" d={d} />
                <path className="mizu-flow-wire-line" d={d} />
                {a.status === "running" && (
                  <path className="mizu-flow-wire-flow" d={d} />
                )}
                {edge.label && (
                  <text x={mid.x} y={mid.y - 8} textAnchor="middle">
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
          {wirePath && (
            <path
              className="mizu-flow-wire-preview"
              d={wirePath}
              data-snapped={snapTarget ? "" : undefined}
            />
          )}
        </svg>

        {shown.map((node) => {
          const inputs = ins(node),
            outputs = outs(node);
          const upstream = edges
            .filter((e) => e.target === node.id)
            .map((e) => byId.get(e.source)?.label)
            .filter(Boolean);
          const downstream = edges
            .filter((e) => e.source === node.id)
            .map((e) => byId.get(e.target)?.label)
            .filter(Boolean);
          return (
            <PlaneItem
              key={node.id}
              id={node.id}
              x={node.x}
              y={node.y}
              width={nodeWidth}
              height={HEAD + rows(node) * ROW + FOOT}
              label={`${node.kind ? `${node.kind}: ` : ""}${node.label}${node.status && node.status !== "idle" ? `, ${node.status}` : ""}`}
              aria-describedby={`${id}-${node.id}-links`}
              className="mizu-flow-node"
              data-status={node.status ?? "idle"}
              data-selected={choice === node.id || undefined}
              onPointerDownCapture={() => setChoice(node.id)}
              onFocus={() => {
                if (!wire) setChoice(node.id);
              }}
              onMove={
                editable
                  ? (x, y) =>
                      setNodes(
                        nodes.map((n) =>
                          n.id === node.id
                            ? {
                                ...n,
                                x: Math.round(x / GRID) * GRID,
                                y: Math.round(y / GRID) * GRID,
                              }
                            : n,
                        ),
                      )
                  : undefined
              }
            >
              <div className="mizu-flow-node-head">
                {renderNode ? (
                  renderNode(node)
                ) : (
                  <>
                    <p className="mizu-flow-node-kind">
                      <span>{node.kind ?? "Step"}</span>
                      {node.status && node.status !== "idle" && (
                        <i data-status={node.status}>{node.status}</i>
                      )}
                    </p>
                    <p className="mizu-flow-node-title">{node.label}</p>
                    {node.description && (
                      <p className="mizu-flow-node-note">{node.description}</p>
                    )}
                  </>
                )}
              </div>
              <div className="mizu-flow-ports">
                {Array.from({ length: rows(node) }, (_, i) => (
                  <div key={i} className="mizu-flow-port-row">
                    {inputs[i] !== undefined ? (
                      <button
                        type="button"
                        className="mizu-flow-port"
                        data-side="in"
                        data-snapped={
                          snapTarget?.[0] === node.id &&
                          snapTarget[1] === inputs[i]
                            ? ""
                            : undefined
                        }
                        data-target={
                          wire && wire.node !== node.id ? "" : undefined
                        }
                        aria-label={`${node.label} input ${inputs[i]}${wire && wire.node !== node.id ? ", connect here" : ""}`}
                        tabIndex={wire && wire.node !== node.id ? 0 : -1}
                        onClick={() =>
                          wire &&
                          connect(
                            { node: wire.node, port: wire.port },
                            { node: node.id, port: inputs[i]! },
                          )
                        }
                      >
                        <i aria-hidden="true" />
                        {inputs[i]}
                      </button>
                    ) : (
                      <span />
                    )}
                    {outputs[i] !== undefined ? (
                      <button
                        type="button"
                        className="mizu-flow-port"
                        data-side="out"
                        data-active={
                          wire?.node === node.id && wire.port === outputs[i]
                            ? ""
                            : undefined
                        }
                        aria-label={`${node.label} output ${outputs[i]}${editable ? ", start a connection" : ""}`}
                        disabled={!editable}
                        onPointerDown={(e) =>
                          startWire(node.id, outputs[i]!, e)
                        }
                        onClick={(e) => {
                          if (e.detail !== 0) return;
                          setWire({ node: node.id, port: outputs[i]! });
                          announce(
                            `Connecting from ${node.label} ${outputs[i]}. Tab to an input and press Enter, or Escape to cancel.`,
                          );
                        }}
                      >
                        {outputs[i]}
                        <i aria-hidden="true" />
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>
                ))}
              </div>
              <span id={`${id}-${node.id}-links`} className="mizu-sr-only">
                {upstream.length
                  ? `Receives from ${upstream.join(", ")}.`
                  : "No inputs connected."}{" "}
                {downstream.length
                  ? `Sends to ${downstream.join(", ")}.`
                  : "No outputs connected."}
              </span>
            </PlaneItem>
          );
        })}
      </Plane>
      {refusal && (
        <p className="mizu-flow-refusal" role="alert">
          {refusal}
        </p>
      )}
      <span className="mizu-sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </div>
  );
}
