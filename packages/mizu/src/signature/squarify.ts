export type Box = { x: number; y: number; w: number; h: number };

/** Squarified layout (Bruls, Huizing, van Wijk): rows along the shorter side keep aspect ratios near 1. */
export function squarify<T>(
  items: readonly { item: T; value: number }[],
  box: Box,
) {
  const out = new Map<T, Box>();
  const sorted = items
    .filter((i) => i.value > 0)
    .sort((a, b) => b.value - a.value);
  const total = sorted.reduce((s, i) => s + i.value, 0);
  if (!total || box.w <= 0 || box.h <= 0) return out;
  const scale = (box.w * box.h) / total;
  let { x, y, w, h } = box;
  let row: { item: T; area: number }[] = [];
  const worst = (r: { area: number }[], side: number) => {
    const sum = r.reduce((s, i) => s + i.area, 0);
    const max = Math.max(...r.map((i) => i.area)),
      min = Math.min(...r.map((i) => i.area));
    return Math.max(
      (side * side * max) / (sum * sum),
      (sum * sum) / (side * side * min),
    );
  };
  const place = () => {
    const sum = row.reduce((s, i) => s + i.area, 0);
    if (w >= h) {
      const width = sum / h;
      let cy = y;
      for (const r of row) {
        out.set(r.item, { x, y: cy, w: width, h: r.area / width });
        cy += r.area / width;
      }
      x += width;
      w -= width;
    } else {
      const height = sum / w;
      let cx = x;
      for (const r of row) {
        out.set(r.item, { x: cx, y, w: r.area / height, h: height });
        cx += r.area / height;
      }
      y += height;
      h -= height;
    }
    row = [];
  };
  for (const { item, value } of sorted) {
    const next = { item, area: value * scale };
    const side = Math.min(w, h);
    if (row.length && worst([...row, next], side) > worst(row, side)) place();
    row.push(next);
  }
  if (row.length) place();
  return out;
}
