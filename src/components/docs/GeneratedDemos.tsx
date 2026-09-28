"use client";
import dynamic from "next/dynamic";
export const GENERATED_DEMOS = {
  chronicle: dynamic(() =>
    import("./demos/generated/signature").then((m) => m.ChronicleDemo),
  ),
  "trend-chart": dynamic(() =>
    import("./demos/generated/signature").then((m) => m.TrendChartDemo),
  ),
  waveform: dynamic(() =>
    import("./demos/generated/signature").then((m) => m.WaveformDemo),
  ),
  plane: dynamic(() =>
    import("./demos/generated/signature").then((m) => m.PlaneDemo),
  ),
  "flow-graph": dynamic(() =>
    import("./demos/generated/signature").then((m) => m.FlowGraphDemo),
  ),
  treemap: dynamic(() =>
    import("./demos/generated/signature").then((m) => m.TreemapDemo),
  ),
  board: dynamic(() =>
    import("./demos/generated/signature").then((m) => m.BoardDemo),
  ),
  outliner: dynamic(() =>
    import("./demos/generated/signature").then((m) => m.OutlinerDemo),
  ),
  "query-builder": dynamic(() =>
    import("./demos/generated/signature").then((m) => m.QueryBuilderDemo),
  ),
  annotator: dynamic(() =>
    import("./demos/generated/signature").then((m) => m.AnnotatorDemo),
  ),
  tour: dynamic(() =>
    import("./demos/generated/signature").then((m) => m.TourDemo),
  ),
  interview: dynamic(() =>
    import("./demos/generated/signature").then((m) => m.InterviewDemo),
  ),
  "transfer-queue": dynamic(() =>
    import("./demos/generated/signature").then((m) => m.TransferQueueDemo),
  ),
  mark: dynamic(() =>
    import("./demos/generated/foundation").then((m) => m.MarkDemo),
  ),
  "section-tag": dynamic(() =>
    import("./demos/generated/foundation").then((m) => m.SectionTagDemo),
  ),
  rule: dynamic(() =>
    import("./demos/generated/foundation").then((m) => m.RuleDemo),
  ),
  badge: dynamic(() =>
    import("./demos/generated/foundation").then((m) => m.BadgeDemo),
  ),
  spinner: dynamic(() =>
    import("./demos/generated/foundation").then((m) => m.SpinnerDemo),
  ),
  frame: dynamic(() =>
    import("./demos/generated/foundation").then((m) => m.FrameDemo),
  ),
  slider: dynamic(() =>
    import("./demos/generated/foundation").then((m) => m.SliderDemo),
  ),
  tooltip: dynamic(() =>
    import("./demos/generated/foundation").then((m) => m.TooltipDemo),
  ),
  "form-field": dynamic(() =>
    import("./demos/generated/forms").then((m) => m.FormFieldDemo),
  ),
  "text-field": dynamic(() =>
    import("./demos/generated/forms").then((m) => m.TextFieldDemo),
  ),
  "text-area": dynamic(() =>
    import("./demos/generated/forms").then((m) => m.TextAreaDemo),
  ),
  "select-field": dynamic(() =>
    import("./demos/generated/forms").then((m) => m.SelectFieldDemo),
  ),
  checkbox: dynamic(() =>
    import("./demos/generated/forms").then((m) => m.CheckboxDemo),
  ),
  switch: dynamic(() =>
    import("./demos/generated/forms").then((m) => m.SwitchDemo),
  ),
  "search-field": dynamic(() =>
    import("./demos/generated/forms").then((m) => m.SearchFieldDemo),
  ),
  "password-field": dynamic(() =>
    import("./demos/generated/forms").then((m) => m.PasswordFieldDemo),
  ),
  "radio-group": dynamic(() =>
    import("./demos/generated/forms").then((m) => m.RadioGroupDemo),
  ),
  "segmented-control": dynamic(() =>
    import("./demos/generated/forms").then((m) => m.SegmentedControlDemo),
  ),
  "number-field": dynamic(() =>
    import("./demos/generated/forms").then((m) => m.NumberFieldDemo),
  ),
  rating: dynamic(() =>
    import("./demos/generated/forms").then((m) => m.RatingDemo),
  ),
  "color-picker": dynamic(() =>
    import("./demos/generated/forms").then((m) => m.ColorPickerDemo),
  ),
  "tag-input": dynamic(() =>
    import("./demos/generated/forms").then((m) => m.TagInputDemo),
  ),
  "file-dropzone": dynamic(() =>
    import("./demos/generated/forms").then((m) => m.FileDropzoneDemo),
  ),
  "async-form": dynamic(() =>
    import("./demos/generated/forms").then((m) => m.AsyncFormDemo),
  ),
  status: dynamic(() =>
    import("./demos/generated/status").then((m) => m.StatusDemo),
  ),
  alert: dynamic(() =>
    import("./demos/generated/status").then((m) => m.AlertDemo),
  ),
  progress: dynamic(() =>
    import("./demos/generated/status").then((m) => m.ProgressDemo),
  ),
  meter: dynamic(() =>
    import("./demos/generated/status").then((m) => m.MeterDemo),
  ),
  skeleton: dynamic(() =>
    import("./demos/generated/status").then((m) => m.SkeletonDemo),
  ),
  "empty-state": dynamic(() =>
    import("./demos/generated/status").then((m) => m.EmptyStateDemo),
  ),
  "error-state": dynamic(() =>
    import("./demos/generated/status").then((m) => m.ErrorStateDemo),
  ),
  "connection-status": dynamic(() =>
    import("./demos/generated/status").then((m) => m.ConnectionStatusDemo),
  ),
  "save-indicator": dynamic(() =>
    import("./demos/generated/status").then((m) => m.SaveIndicatorDemo),
  ),
  "async-boundary": dynamic(() =>
    import("./demos/generated/status").then((m) => m.AsyncBoundaryDemo),
  ),
  "task-progress": dynamic(() =>
    import("./demos/generated/status").then((m) => m.TaskProgressDemo),
  ),
  "async-button": dynamic(() =>
    import("./demos/generated/status").then((m) => m.AsyncButtonDemo),
  ),
  "data-table": dynamic(() =>
    import("./demos/generated/data").then((m) => m.DataTableDemo),
  ),
  "description-list": dynamic(() =>
    import("./demos/generated/data").then((m) => m.DescriptionListDemo),
  ),
  stat: dynamic(() => import("./demos/generated/data").then((m) => m.StatDemo)),
  "bar-chart": dynamic(() =>
    import("./demos/generated/data").then((m) => m.BarChartDemo),
  ),
  sparkline: dynamic(() =>
    import("./demos/generated/data").then((m) => m.SparklineDemo),
  ),
  heatmap: dynamic(() =>
    import("./demos/generated/data").then((m) => m.HeatmapDemo),
  ),
  timeline: dynamic(() =>
    import("./demos/generated/data").then((m) => m.TimelineDemo),
  ),
  "activity-feed": dynamic(() =>
    import("./demos/generated/data").then((m) => m.ActivityFeedDemo),
  ),
  "diff-view": dynamic(() =>
    import("./demos/generated/data").then((m) => m.DiffViewDemo),
  ),
  "data-inspector": dynamic(() =>
    import("./demos/generated/data").then((m) => m.DataInspectorDemo),
  ),
  "tree-view": dynamic(() =>
    import("./demos/generated/data").then((m) => m.TreeViewDemo),
  ),
  "comparison-table": dynamic(() =>
    import("./demos/generated/data").then((m) => m.ComparisonTableDemo),
  ),
  breadcrumbs: dynamic(() =>
    import("./demos/generated/navigation").then((m) => m.BreadcrumbsDemo),
  ),
  pagination: dynamic(() =>
    import("./demos/generated/navigation").then((m) => m.PaginationDemo),
  ),
  stepper: dynamic(() =>
    import("./demos/generated/navigation").then((m) => m.StepperDemo),
  ),
  "anchor-nav": dynamic(() =>
    import("./demos/generated/navigation").then((m) => m.AnchorNavDemo),
  ),
  "side-nav": dynamic(() =>
    import("./demos/generated/navigation").then((m) => m.SideNavDemo),
  ),
  "bottom-nav": dynamic(() =>
    import("./demos/generated/navigation").then((m) => m.BottomNavDemo),
  ),
  "action-menu": dynamic(() =>
    import("./demos/generated/navigation").then((m) => m.ActionMenuDemo),
  ),
  "command-palette": dynamic(() =>
    import("./demos/generated/navigation").then((m) => m.CommandPaletteDemo),
  ),
  avatar: dynamic(() =>
    import("./demos/generated/content").then((m) => m.AvatarDemo),
  ),
  kbd: dynamic(() =>
    import("./demos/generated/content").then((m) => m.KbdDemo),
  ),
  "code-block": dynamic(() =>
    import("./demos/generated/content").then((m) => m.CodeBlockDemo),
  ),
  quote: dynamic(() =>
    import("./demos/generated/content").then((m) => m.QuoteDemo),
  ),
  prose: dynamic(() =>
    import("./demos/generated/content").then((m) => m.ProseDemo),
  ),
  "image-figure": dynamic(() =>
    import("./demos/generated/content").then((m) => m.ImageFigureDemo),
  ),
  "media-player": dynamic(() =>
    import("./demos/generated/content").then((m) => m.MediaPlayerDemo),
  ),
  "link-card": dynamic(() =>
    import("./demos/generated/content").then((m) => m.LinkCardDemo),
  ),
  "file-card": dynamic(() =>
    import("./demos/generated/content").then((m) => m.FileCardDemo),
  ),
  checklist: dynamic(() =>
    import("./demos/generated/content").then((m) => m.ChecklistDemo),
  ),
  stack: dynamic(() =>
    import("./demos/generated/layout").then((m) => m.StackDemo),
  ),
  grid: dynamic(() =>
    import("./demos/generated/layout").then((m) => m.GridDemo),
  ),
  "split-pane": dynamic(() =>
    import("./demos/generated/layout").then((m) => m.SplitPaneDemo),
  ),
  "aspect-ratio": dynamic(() =>
    import("./demos/generated/layout").then((m) => m.AspectRatioDemo),
  ),
  "scroll-area": dynamic(() =>
    import("./demos/generated/layout").then((m) => m.ScrollAreaDemo),
  ),
  "app-shell": dynamic(() =>
    import("./demos/generated/layout").then((m) => m.AppShellDemo),
  ),
  combobox: dynamic(() =>
    import("./demos/generated/interaction").then((m) => m.ComboboxDemo),
  ),
  "multi-select": dynamic(() =>
    import("./demos/generated/interaction").then((m) => m.MultiSelectDemo),
  ),
  "inline-edit": dynamic(() =>
    import("./demos/generated/interaction").then((m) => m.InlineEditDemo),
  ),
  "range-selector": dynamic(() =>
    import("./demos/generated/interaction").then((m) => m.RangeSelectorDemo),
  ),
  "reorder-list": dynamic(() =>
    import("./demos/generated/interaction").then((m) => m.ReorderListDemo),
  ),
  "image-compare": dynamic(() =>
    import("./demos/generated/interaction").then((m) => m.ImageCompareDemo),
  ),
  "history-controls": dynamic(() =>
    import("./demos/generated/interaction").then((m) => m.HistoryControlsDemo),
  ),
  "confirm-action": dynamic(() =>
    import("./demos/generated/interaction").then((m) => m.ConfirmActionDemo),
  ),
  presence: dynamic(() =>
    import("./demos/generated/motion").then((m) => m.PresenceDemo),
  ),
  tilt: dynamic(() =>
    import("./demos/generated/motion").then((m) => m.TiltDemo),
  ),
  parallax: dynamic(() =>
    import("./demos/generated/motion").then((m) => m.ParallaxDemo),
  ),
  "scroll-progress": dynamic(() =>
    import("./demos/generated/motion").then((m) => m.ScrollProgressDemo),
  ),
};
