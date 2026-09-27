export type OutlineItem = {
  id: string;
  text: string;
  done?: boolean;
  collapsed?: boolean;
  children?: readonly OutlineItem[];
};
export type OutlineRow = {
  id: string;
  text: string;
  depth: number;
  done?: boolean;
  collapsed?: boolean;
};

/** Depth-first rows; editing works on this flat form and is rebuilt with `build`. */
export function flatten(
  items: readonly OutlineItem[],
  depth = 0,
  out: OutlineRow[] = [],
) {
  for (const { children, ...item } of items) {
    out.push({ ...item, depth });
    if (children?.length) flatten(children, depth + 1, out);
  }
  return out;
}

export function build(rows: readonly OutlineRow[]): OutlineItem[] {
  const root: OutlineItem[] = [];
  const stack: { depth: number; children: OutlineItem[] }[] = [
    { depth: -1, children: root },
  ];
  for (const { depth, ...row } of rows) {
    while (stack.length > 1 && stack[stack.length - 1]!.depth >= depth)
      stack.pop();
    const item: OutlineItem & { children: OutlineItem[] } = {
      ...row,
      children: [],
    };
    stack[stack.length - 1]!.children.push(item);
    stack.push({ depth, children: item.children });
  }
  const prune = (items: OutlineItem[]): OutlineItem[] =>
    items.map(({ children, ...item }) =>
      children?.length
        ? { ...item, children: prune(children as OutlineItem[]) }
        : item,
    );
  return prune(root);
}

/** Index after the last descendant of row `i`. */
export const subtreeEnd = (rows: readonly OutlineRow[], i: number) => {
  let j = i + 1;
  while (j < rows.length && rows[j]!.depth > rows[i]!.depth) j++;
  return j;
};
export const hasChildren = (rows: readonly OutlineRow[], i: number) =>
  (rows[i + 1]?.depth ?? -1) > rows[i]!.depth;

/** Tab: become the last child of the previous sibling, bringing descendants along. */
export function indent(rows: readonly OutlineRow[], i: number) {
  const previous = rows[i - 1];
  if (!previous || previous.depth < rows[i]!.depth) return rows;
  const end = subtreeEnd(rows, i);
  let parent = i - 1;
  while (rows[parent]!.depth > rows[i]!.depth) parent--;
  return rows.map((r, k) =>
    k >= i && k < end
      ? { ...r, depth: r.depth + 1 }
      : k === parent
        ? { ...r, collapsed: false }
        : r,
  );
}

/** Shift+Tab: leave the parent and follow its whole subtree, so later siblings stay put. */
export function outdent(rows: readonly OutlineRow[], i: number, floor = 0) {
  const depth = rows[i]!.depth;
  if (depth <= floor) return rows;
  let parent = i - 1;
  while (parent >= 0 && rows[parent]!.depth >= depth) parent--;
  if (parent < 0) return rows;
  const end = subtreeEnd(rows, i);
  const block = rows.slice(i, end).map((r) => ({ ...r, depth: r.depth - 1 }));
  const rest = [...rows.slice(0, i), ...rows.slice(end)];
  const at = subtreeEnd(rest, parent);
  return [...rest.slice(0, at), ...block, ...rest.slice(at)];
}

/** Alt+Up / Alt+Down: swap with the neighbouring sibling, subtrees included. */
export function moveSibling(
  rows: readonly OutlineRow[],
  i: number,
  direction: -1 | 1,
) {
  const depth = rows[i]!.depth;
  const end = subtreeEnd(rows, i);
  if (direction === 1) {
    if (rows[end]?.depth !== depth) return rows;
    const nextEnd = subtreeEnd(rows, end);
    return [
      ...rows.slice(0, i),
      ...rows.slice(end, nextEnd),
      ...rows.slice(i, end),
      ...rows.slice(nextEnd),
    ];
  }
  let previous = i - 1;
  while (previous >= 0 && rows[previous]!.depth > depth) previous--;
  if (previous < 0 || rows[previous]!.depth !== depth) return rows;
  return [
    ...rows.slice(0, previous),
    ...rows.slice(i, end),
    ...rows.slice(previous, i),
    ...rows.slice(end),
  ];
}

/** Rows that are drawn: descendants of collapsed rows are skipped, as is anything outside the zoomed item. */
export function visibleRows(rows: readonly OutlineRow[], zoom: string | null) {
  let start = 0,
    end = rows.length,
    base = 0;
  if (zoom) {
    const z = rows.findIndex((r) => r.id === zoom);
    if (z !== -1) {
      start = z + 1;
      end = subtreeEnd(rows, z);
      base = rows[z]!.depth + 1;
    }
  }
  const shown: { row: OutlineRow; index: number; level: number }[] = [];
  let hideBelow = Infinity;
  for (let k = start; k < end; k++) {
    const r = rows[k]!;
    if (r.depth > hideBelow) continue;
    hideBelow = r.collapsed && hasChildren(rows, k) ? r.depth : Infinity;
    shown.push({ row: r, index: k, level: r.depth - base });
  }
  return shown;
}
