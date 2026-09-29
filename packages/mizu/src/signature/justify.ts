type Size = { width: number; height: number };
/** Photos `start` to `end` (exclusive) at `height`; a full row spans the width exactly. */
export type GalleryRow = {
  start: number;
  end: number;
  height: number;
  full: boolean;
};

/**
 * Justified rows: photos keep their proportions and each full row fills the
 * width, at the height closest to `target` within half to one and a half of it.
 */
export function justifyRows(
  sizes: readonly Size[],
  width: number,
  target: number,
  gap: number,
) {
  const rows: GalleryRow[] = [];
  const fit = (start: number, end: number, ratios: number) =>
    (width - gap * (end - start - 1)) / ratios;
  let start = 0,
    ratios = 0;
  sizes.forEach((size, i) => {
    const ratio = size.width / (size.height || 1);
    const height = fit(start, i + 1, ratios + ratio);
    if (height > target) {
      ratios += ratio;
      return;
    }
    // Break before this photo when the shorter row lands closer to the target,
    // or when taking it would crush the row (a panorama after a portrait).
    const without = i > start ? fit(start, i, ratios) : Infinity;
    if (
      without - target < target - height ||
      (i > start && height < target / 2)
    ) {
      rows.push({
        start,
        end: i,
        height: Math.min(without, target * 1.5),
        full: without <= target * 1.5,
      });
      start = i;
      ratios = ratio;
      if (fit(i, i + 1, ratio) > target) return;
    } else ratios += ratio;
    rows.push({
      start,
      end: i + 1,
      height: fit(start, i + 1, ratios),
      full: true,
    });
    start = i + 1;
    ratios = 0;
  });
  if (start < sizes.length)
    rows.push({
      start,
      end: sizes.length,
      height: Math.min(target, fit(start, sizes.length, ratios)),
      full: false,
    });
  return rows;
}
