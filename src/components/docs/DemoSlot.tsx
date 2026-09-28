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
  treemap: dynamic(() =>
    import("./demos/signature/treemap").then((m) => m.TreemapShowcase),
  ),
  board: dynamic(() =>
    import("./demos/signature/board").then((m) => m.BoardShowcase),
  ),
  outliner: dynamic(() =>
    import("./demos/signature/outliner").then((m) => m.OutlinerShowcase),
  ),
  "query-builder": dynamic(() =>
    import("./demos/signature/query").then((m) => m.QueryBuilderShowcase),
  ),
  annotator: dynamic(() =>
    import("./demos/signature/annotator").then((m) => m.AnnotatorShowcase),
  ),
  tour: dynamic(() => import("./demos/signature/tour").then((m) => m.TourShowcase)),
  interview: dynamic(() =>
    import("./demos/signature/interview").then((m) => m.InterviewShowcase),
  ),
  "transfer-queue": dynamic(() =>
    import("./demos/signature/transfer").then((m) => m.TransferQueueShowcase),
  ),
  "triage-deck": dynamic(() =>
    import("./demos/signature/triage").then((m) => m.TriageDeckShowcase),
  ),
  gallery: dynamic(() =>
    import("./demos/signature/gallery").then((m) => m.GalleryShowcase),
  ),
  folio: dynamic(() =>
    import("./demos/signature/folio").then((m) => m.FolioShowcase),
  ),
  "split-flap": dynamic(() =>
    import("./demos/signature/flap").then((m) => m.SplitFlapShowcase),
  ),
  "column-browser": dynamic(() =>
    import("./demos/signature/columns").then((m) => m.ColumnBrowserShowcase),
  ),
  "log-stream": dynamic(() =>
    import("./demos/signature/log").then((m) => m.LogStreamShowcase),
  ),
  knob: dynamic(() =>
    import("./demos/signature/controls").then((m) => m.KnobShowcase),
  ),
  fader: dynamic(() =>
    import("./demos/signature/controls").then((m) => m.FaderShowcase),
  ),
  "xy-pad": dynamic(() =>
    import("./demos/signature/controls").then((m) => m.XYPadShowcase),
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
