export const FLAP_CHARACTERS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-/'&!?";

/**
 * The flaps a cell shows on its way from `from` to `to`: always forward
 * through the drum like the real mechanism, but never more than `most`, so a
 * long way round arrives in time.
 */
export function flapPath(
  from: string,
  to: string,
  characters: string,
  most = 12,
) {
  const drum = [...characters];
  const a = drum.indexOf(from),
    b = drum.indexOf(to);
  if (from === to) return [];
  if (a < 0 || b < 0) return [to];
  const steps = (b - a + drum.length) % drum.length;
  const path: string[] = [];
  for (let s = Math.max(1, steps - most + 1); s <= steps; s++)
    path.push(drum[(a + s) % drum.length]!);
  return path;
}
