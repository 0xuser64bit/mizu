import type { GalleryItem } from "@/mizu";
import { seeded } from "./shared";

/*
 * Generated landscape "plates": layered ridgelines drawn with midpoint
 * displacement, so the gallery demos need no network images and stay crisp
 * at any zoom.
 */
type Palette = {
  sky: [string, string];
  haze: string;
  ink: string;
  sun?: string;
  night?: boolean;
  water?: boolean;
  mood: string;
};

const PALETTES: Record<string, Palette> = {
  dawn: {
    sky: ["#f2dcc0", "#f3a978"],
    haze: "#dc9a7e",
    ink: "#3a2626",
    sun: "#fff4df",
    mood: "under a pale dawn with a low sun",
  },
  dusk: {
    sky: ["#2e2a4c", "#e2785b"],
    haze: "#8c5a6e",
    ink: "#161221",
    sun: "#ffd8a8",
    mood: "at dusk, the sun sinking into haze",
  },
  night: {
    sky: ["#0b1120", "#22304c"],
    haze: "#34425e",
    ink: "#070a12",
    sun: "#efe9d6",
    night: true,
    mood: "at night beneath a full moon and stars",
  },
  fog: {
    sky: ["#dfe1da", "#c9ccc2"],
    haze: "#b7bbb0",
    ink: "#4a5049",
    mood: "dissolving into morning fog",
  },
  desert: {
    sky: ["#9cc2d6", "#f1e3c4"],
    haze: "#e0b98c",
    ink: "#6b3d22",
    sun: "#fffaf0",
    mood: "in white noon light over ochre desert",
  },
  winter: {
    sky: ["#c5d4df", "#eef2f3"],
    haze: "#aebfcc",
    ink: "#2d3b48",
    sun: "#ffffff",
    mood: "in winter light with a faint sun",
  },
  ember: {
    sky: ["#1c0f0c", "#8a3219"],
    haze: "#5e2417",
    ink: "#0e0706",
    sun: "#ff8a4c",
    mood: "under an ember sky with a red sun",
  },
  sea: {
    sky: ["#f4e6cf", "#e9b98f"],
    haze: "#c79a86",
    ink: "#2b2330",
    sun: "#fff1d6",
    water: true,
    mood: "over still water catching the sun",
  },
};

const SHAPES: [number, number][] = [
  [1500, 1000],
  [1000, 1500],
  [1600, 1200],
  [1920, 1080],
  [1200, 1500],
  [1200, 1200],
  [2100, 900],
  [1500, 1000],
];

const PLATES_SPEC: [string, keyof typeof PALETTES][] = [
  ["Harbour at first light", "sea"],
  ["The long ridge", "dawn"],
  ["Fog over the pass", "fog"],
  ["Night crossing", "night"],
  ["Salt flats, noon", "desert"],
  ["Ember country", "ember"],
  ["Before the snow", "winter"],
  ["Late ferry", "dusk"],
  ["Kiln hills", "desert"],
  ["Quiet reservoir", "sea"],
  ["Moon over the dam", "night"],
  ["Copper evening", "dusk"],
  ["Lowlands in rain", "fog"],
  ["White hour", "winter"],
  ["Ash and gold", "ember"],
  ["The eastern valleys", "dawn"],
  ["Far islands", "sea"],
  ["The last lamp", "night"],
];

function mix(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16),
    pb = parseInt(b.slice(1), 16);
  const channel = (shift: number) =>
    Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t);
  return `rgb(${channel(16)},${channel(8)},${channel(0)})`;
}

/** Midpoint displacement: a natural ridgeline, normalised to 0–1. */
function ridge(rand: () => number, segments = 64, roughness = 0.56) {
  const points = new Array<number>(segments + 1).fill(0);
  points[0] = rand();
  points[segments] = rand();
  for (let step = segments, amp = 1; step > 1; step /= 2, amp *= roughness)
    for (let i = step / 2; i < segments; i += step)
      points[i] =
        (points[i - step / 2]! + points[i + step / 2]!) / 2 +
        (rand() * 2 - 1) * amp;
  const low = Math.min(...points),
    high = Math.max(...points);
  return points.map((p) => (p - low) / (high - low || 1));
}

function draw(seed: number, w: number, h: number, p: Palette) {
  const rand = seeded(seed);
  const f = (n: number) => n.toFixed(1);
  const horizon = h * (p.water ? 0.58 : 0.42 + rand() * 0.14);
  const layers = 4 + Math.floor(rand() * 3);
  const sun = p.sun && {
    x: w * (0.18 + rand() * 0.64),
    y: horizon - h * (0.1 + rand() * 0.2),
    r: Math.min(w, h) * (0.035 + rand() * 0.04),
  };
  const out = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`,
    `<defs><linearGradient id="s" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient>`,
    `<radialGradient id="g"><stop offset="0" stop-color="${p.sun ?? "#fff"}" stop-opacity=".5"/><stop offset="1" stop-color="${p.sun ?? "#fff"}" stop-opacity="0"/></radialGradient></defs>`,
    `<rect width="${w}" height="${h}" fill="url(#s)"/>`,
  ];
  if (p.night)
    for (let i = 0; i < 90; i++)
      out.push(
        `<circle cx="${f(rand() * w)}" cy="${f(rand() * horizon)}" r="${f(0.6 + rand() * 1.8)}" fill="#fff" opacity="${(0.25 + rand() * 0.6).toFixed(2)}"/>`,
      );
  if (sun)
    out.push(
      `<circle cx="${f(sun.x)}" cy="${f(sun.y)}" r="${f(sun.r * 6)}" fill="url(#g)"/>`,
      `<circle cx="${f(sun.x)}" cy="${f(sun.y)}" r="${f(sun.r)}" fill="${p.sun}"/>`,
    );
  const floor = p.water ? horizon : h;
  for (let l = 0; l < layers; l++) {
    const t = l / (layers - 1);
    const top = p.water
      ? horizon - h * (0.2 - t * 0.14) * (0.6 + rand() * 0.6)
      : horizon + (h - horizon) * t * 0.72 - h * 0.14 * (1 - t);
    const lift = h * (p.water ? 0.1 : 0.05 + 0.16 * (1 - t) * (0.5 + rand()));
    const line = ridge(rand);
    const path = line
      .map(
        (v, i) =>
          `${f((i / (line.length - 1)) * w)},${f(top + (1 - v) * lift)}`,
      )
      .join("L");
    out.push(
      `<path d="M0,${f(floor)}L${path}L${w},${f(floor)}Z" fill="${mix(p.haze, p.ink, t ** 1.3)}"/>`,
    );
  }
  if (p.water) {
    // Still water: the sky's own colours, darkening toward you, with a broken path of light.
    out.push(
      `<defs><linearGradient id="w" x2="0" y2="1"><stop offset="0" stop-color="${mix(p.sky[1], p.haze, 0.35)}"/><stop offset="1" stop-color="${mix(p.haze, p.ink, 0.7)}"/></linearGradient></defs>`,
      `<rect y="${f(horizon)}" width="${w}" height="${f(h - horizon)}" fill="url(#w)"/>`,
    );
    const cx = sun ? sun.x : w / 2;
    for (let i = 0; i < 48; i++) {
      const depth = ((i + rand()) / 48) ** 1.7;
      const y = horizon + 4 + (h - horizon - 8) * depth;
      const span = w * (0.01 + depth * 0.09) * (0.4 + rand());
      const drift = (rand() - 0.5) * w * (0.02 + depth * 0.12);
      out.push(
        `<rect x="${f(cx + drift - span / 2)}" y="${f(y)}" width="${f(span)}" height="${f(1 + depth * 2.5)}" fill="${p.sun ?? p.sky[0]}" opacity="${(0.75 - depth * 0.45).toFixed(2)}"/>`,
      );
    }
  }
  out.push("</svg>");
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(out.join(""))}`;
}

export const PLATES: GalleryItem[] = PLATES_SPEC.map(([title, key], i) => {
  const [width, height] = SHAPES[i % SHAPES.length]!;
  const palette = PALETTES[key]!;
  const number = String(i + 1).padStart(2, "0");
  return {
    id: `plate-${number}`,
    src: draw(i * 7919 + 17, width, height, palette),
    alt: `Plate ${number}, ${title}: layered ridgelines ${palette.mood}`,
    width,
    height,
    caption: `Plate ${number} — ${title}`,
  };
});
