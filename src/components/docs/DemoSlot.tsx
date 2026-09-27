"use client";

import dynamic from "next/dynamic";
import { GENERATED_DEMOS } from "./GeneratedDemos";

// Hand-built showcases take precedence; the compiled usage demo remains available beside them.
const SHOWCASES = {
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
  chronicle: dynamic(() =>
    import("./demos/signature/chronicle").then((m) => m.ChronicleShowcase),
  ),
  "trend-chart": dynamic(() =>
    import("./demos/signature/trend").then((m) => m.TrendChartShowcase),
  ),
  waveform: dynamic(() =>
    import("./demos/signature/waveform").then((m) => m.WaveformShowcase),
  ),
  plane: dynamic(() =>
    import("./demos/signature/plane").then((m) => m.PlaneShowcase),
  ),
  "flow-graph": dynamic(() =>
    import("./demos/signature/flow").then((m) => m.FlowGraphShowcase),
  ),
};
export function DemoSlot({
  slug,
  usage = false,
}: {
  slug: string;
  usage?: boolean;
}) {
  const Demo =
    (!usage && SHOWCASES[slug as keyof typeof SHOWCASES]) ||
    GENERATED_DEMOS[slug as keyof typeof GENERATED_DEMOS];
  return Demo ? <Demo /> : null;
}
