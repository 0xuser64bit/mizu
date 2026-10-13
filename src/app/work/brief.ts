/**
 * What a commission brief holds, shared by the page that asks and the action
 * that sends. The server re-checks everything here: the page's checks are
 * for the visitor, these are for the inbox.
 */

/** The commissions on offer, cheapest first. Prices are floors in USD, not quotes. */
export const COMMISSIONS = [
  {
    id: "craft",
    name: "Craft pass",
    from: 4_000,
    weeks: "1–2 weeks",
    line: "Your product already works. I go through it and give it motion, states and finish, without changing what it does.",
    includes: [
      "Motion with a reason",
      "Empty, loading and error states",
      "A written list of what changed",
    ],
  },
  {
    id: "launch",
    name: "Launch site",
    from: 8_000,
    weeks: "2–4 weeks",
    line: "A landing page or launch site with the same finish as the product it sells, and that holds up past the first screenshot.",
    includes: [
      "Art direction and copy edit",
      "Built, not templated",
      "Fast on a phone",
    ],
  },
  {
    id: "signature",
    name: "Signature interface",
    from: 12_000,
    weeks: "3–6 weeks",
    line: "One complete system at the heart of your product — an editor, a timeline, a dashboard, a flow — built to this archive's standard.",
    includes: [
      "Every state, designed",
      "Keyboard paths and reduced motion",
      "Production React, yours to own",
    ],
  },
  {
    id: "system",
    name: "Design system",
    from: 20_000,
    weeks: "6–10 weeks",
    line: "Tokens, components and documentation for your product: the whole kit, written down so the team can keep building after I leave.",
    includes: [
      "Tokens and themes",
      "Components with docs",
      "A handoff your team can extend",
    ],
  },
] as const;

export type CommissionId = (typeof COMMISSIONS)[number]["id"];

export const BUDGETS = [
  { value: "4-8", label: "$4k – $8k" },
  { value: "8-15", label: "$8k – $15k" },
  { value: "15-30", label: "$15k – $30k" },
  { value: "30+", label: "$30k and up" },
  { value: "unsure", label: "Not sure yet" },
] as const;

export const TIMELINES = [
  { value: "now", label: "As soon as possible" },
  { value: "quarter", label: "In the next three months" },
  { value: "later", label: "Later this year" },
  { value: "flexible", label: "Flexible" },
] as const;

export const KINDS = [
  ...COMMISSIONS.map((c) => ({ value: c.id, label: c.name })),
  { value: "unsure", label: "Not sure yet" },
] as const;

export const usd = (n: number) => `$${n / 1000}k`;

export type Brief = {
  kind: string;
  about: string;
  link: string;
  budget: string;
  timeline: string;
  name: string;
  email: string;
};

const LIMITS = { about: 4000, link: 300, name: 120, email: 254 } as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const labelOf = (
  list: readonly { value: string; label: string }[],
  v: string,
) => list.find((o) => o.value === v)?.label;

/** A clean brief, or the first reason it isn't one. */
export function parseBrief(input: unknown): Brief | string {
  if (typeof input !== "object" || input === null) return "Empty brief.";
  const raw = input as Record<string, unknown>;
  const text = (key: string) =>
    typeof raw[key] === "string" ? (raw[key] as string).trim() : "";
  const brief: Brief = {
    kind: text("kind"),
    about: text("about"),
    link: text("link"),
    budget: text("budget"),
    timeline: text("timeline"),
    name: text("name"),
    email: text("email"),
  };
  if (!labelOf(KINDS, brief.kind)) return "Pick what you want made.";
  if (brief.about.length < 10) return "Say a little more about the project.";
  if (!labelOf(BUDGETS, brief.budget)) return "Pick a budget range.";
  if (!labelOf(TIMELINES, brief.timeline)) return "Pick a timeline.";
  if (!brief.name) return "Add your name.";
  if (!EMAIL.test(brief.email)) return "That email address doesn’t look right.";
  for (const [key, max] of Object.entries(LIMITS))
    if (brief[key as keyof typeof LIMITS].length > max)
      return `The ${key} is too long.`;
  return brief;
}

/** The brief as the plain-text email that lands in the studio inbox. */
export function formatBrief(b: Brief) {
  const subject = `Brief — ${labelOf(KINDS, b.kind)} — ${b.name}`.replace(
    /[\r\n]+/g,
    " ",
  );
  const text = [
    `${b.name} <${b.email}>`,
    "",
    `Commission  ${labelOf(KINDS, b.kind)}`,
    `Budget      ${labelOf(BUDGETS, b.budget)}`,
    `Timeline    ${labelOf(TIMELINES, b.timeline)}`,
    `Link        ${b.link || "—"}`,
    "",
    b.about,
  ].join("\n");
  return { subject, text };
}

/** The From of the email: an address as given, or a verified domain alone. */
export function sender(from: string | undefined) {
  if (!from) return "Mizu Studio <onboarding@resend.dev>";
  return from.includes("@") ? from : `Mizu Studio <briefs@${from}>`;
}
