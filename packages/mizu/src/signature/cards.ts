import type { SignatureTone } from "./internal.ts";

export type BoardColumn = { id: string; title: string; limit?: number };
export type BoardCard = {
  id: string;
  column: string;
  title: string;
  meta?: string;
  tags?: readonly string[];
  assignee?: string;
  tone?: SignatureTone;
};

/** Returns cards with `id` moved into `column` before the card now at `index`. */
export function moveCard(
  cards: readonly BoardCard[],
  id: string,
  column: string,
  index: number,
) {
  const card = cards.find((c) => c.id === id);
  if (!card) return [...cards];
  const rest = cards.filter((c) => c.id !== id);
  const inColumn = rest.filter((c) => c.column === column);
  const anchor = inColumn[index];
  const at = anchor
    ? rest.indexOf(anchor)
    : inColumn.length
      ? rest.indexOf(inColumn[inColumn.length - 1]!) + 1
      : rest.length;
  return [...rest.slice(0, at), { ...card, column }, ...rest.slice(at)];
}
