"use client";

import dynamic from "next/dynamic";
import { GENERATED_DEMOS } from "./GeneratedDemos";

const ORIGINAL_DEMOS = {
  button: dynamic(() => import("./demos/foundation").then((m) => m.ButtonDemo)),
  primitives: dynamic(() =>
    import("./demos/foundation").then((m) => m.PrimitivesDemo),
  ),
  maskline: dynamic(() => import("./demos/motion").then((m) => m.MaskLineDemo)),
  reveal: dynamic(() => import("./demos/motion").then((m) => m.RevealDemo)),
  magnetic: dynamic(() => import("./demos/motion").then((m) => m.MagneticDemo)),
  marquee: dynamic(() => import("./demos/motion").then((m) => m.MarqueeDemo)),
  pagewipe: dynamic(() => import("./demos/motion").then((m) => m.PageWipeDemo)),
  specimen: dynamic(() => import("./demos/type").then((m) => m.SpecimenDemo)),
  softtype: dynamic(() => import("./demos/type").then((m) => m.SoftTypeDemo)),
  wavetext: dynamic(() => import("./demos/type").then((m) => m.WaveTextDemo)),
  ghostword: dynamic(() => import("./demos/type").then((m) => m.GhostWordDemo)),
  pinfield: dynamic(() => import("./demos/lab").then((m) => m.PinfieldDemo)),
  signal: dynamic(() => import("./demos/lab").then((m) => m.SignalDemo)),
  ripplesurface: dynamic(() => import("./demos/lab").then((m) => m.RippleDemo)),
  countup: dynamic(() => import("./demos/feedback").then((m) => m.CountUpDemo)),
  copybutton: dynamic(() =>
    import("./demos/feedback").then((m) => m.CopyButtonDemo),
  ),
  toast: dynamic(() => import("./demos/feedback").then((m) => m.ToastDemo)),
  accordion: dynamic(() =>
    import("./demos/composite").then((m) => m.AccordionDemo),
  ),
  tabs: dynamic(() => import("./demos/composite").then((m) => m.TabsDemo)),
  dialog: dynamic(() => import("./demos/composite").then((m) => m.DialogDemo)),
  nav: dynamic(() => import("./demos/composite").then((m) => m.NavDemo)),
};
export function DemoSlot({ slug }: { slug: string }) {
  const demos = { ...ORIGINAL_DEMOS, ...GENERATED_DEMOS };
  const Demo = demos[slug as keyof typeof demos];
  return Demo ? <Demo /> : null;
}
