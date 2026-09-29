export type FlowStatus = "idle" | "running" | "success" | "error" | "skipped";
export type FlowNode = {
  id: string;
  x: number;
  y: number;
  label: string;
  /** A short caption such as TRIGGER or ACTION. */
  kind?: string;
  description?: string;
  /** Input port names. Defaults to one input, "in". Use [] for a source. */
  inputs?: readonly string[];
  /** Output port names. Defaults to one output, "out". Use [] for a sink. */
  outputs?: readonly string[];
  status?: FlowStatus;
};
export type FlowEdge = {
  id: string;
  source: string;
  target: string;
  sourcePort?: string;
  targetPort?: string;
  label?: string;
};

export const HEAD = 76,
  ROW = 28,
  FOOT = 10,
  GRID = 8;
export const ins = (n: FlowNode) => n.inputs ?? ["in"];
export const outs = (n: FlowNode) => n.outputs ?? ["out"];
export const rows = (n: FlowNode) => Math.max(1, ins(n).length, outs(n).length);

/** Layered layout: longest path from the sources, then two barycentre passes to untangle. */
export function tidyFlow(
  nodes: readonly FlowNode[],
  edges: readonly FlowEdge[],
  width = 232,
) {
  const incoming = new Map(nodes.map((n) => [n.id, [] as string[]]));
  const outgoing = new Map(nodes.map((n) => [n.id, [] as string[]]));
  for (const e of edges)
    if (
      incoming.has(e.target) &&
      outgoing.has(e.source) &&
      e.source !== e.target
    ) {
      incoming.get(e.target)!.push(e.source);
      outgoing.get(e.source)!.push(e.target);
    }
  const layer = new Map<string, number>();
  const visiting = new Set<string>();
  const depth = (id: string): number => {
    if (layer.has(id)) return layer.get(id)!;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const d =
      Math.max(
        -1,
        ...incoming
          .get(id)!
          .filter((p) => !visiting.has(p))
          .map(depth),
      ) + 1;
    visiting.delete(id);
    layer.set(id, d);
    return d;
  };
  nodes.forEach((n) => depth(n.id));
  const layers: FlowNode[][] = [];
  for (const n of [...nodes].sort((a, b) => a.y - b.y))
    (layers[layer.get(n.id)!] ??= []).push(n);
  for (let pass = 0; pass < 2; pass++)
    for (let l = 1; l < layers.length; l++) {
      const previous = new Map((layers[l - 1] ?? []).map((n, i) => [n.id, i]));
      const score = (n: FlowNode) => {
        const parents = incoming.get(n.id)!.filter((p) => previous.has(p));
        return parents.length
          ? parents.reduce((s, p) => s + previous.get(p)!, 0) / parents.length
          : Infinity;
      };
      layers[l] = [...(layers[l] ?? [])].sort((a, b) => score(a) - score(b));
    }
  const placed = new Map<string, { x: number; y: number }>();
  layers.forEach((column, l) => {
    const heights = column.map((n) => HEAD + rows(n) * ROW + FOOT);
    const total = heights.reduce((s, h) => s + h, 0) + (column.length - 1) * 40;
    let y = -total / 2;
    column.forEach((n, i) => {
      placed.set(n.id, {
        x: l * (width + 112),
        y: Math.round(y / GRID) * GRID,
      });
      y += heights[i]! + 40;
    });
  });
  return nodes.map((n) => ({ ...n, ...placed.get(n.id) }));
}
