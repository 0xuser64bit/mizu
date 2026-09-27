"use client";
// Generated from catalog usage by bun run examples:sync.
import { useState } from "react";
import {
  Breadcrumbs,
  Pagination,
  Stepper,
  AnchorNav,
  SideNav,
  BottomNav,
  ActionMenu,
  CommandPalette,
  Button,
} from "@/mizu";

export function BreadcrumbsDemo() {
  return (
    <Breadcrumbs
      items={[
        { label: "Collection", href: "/components" },
        { label: "Navigation", href: "/components?category=Navigation" },
        { label: "Breadcrumbs" },
      ]}
    />
  );
}

export function PaginationDemo() {
  const [page, setPage] = useState(3);
  return (
    <div>
      <Pagination page={page} totalPages={12} onPageChange={setPage} />
      <p className="mizu-field-hint">Showing page {page} of 12.</p>
    </div>
  );
}

export function StepperDemo() {
  const [step, setStep] = useState("review");
  return (
    <Stepper
      current={step}
      onStepChange={setStep}
      steps={[
        { id: "prepare", label: "Prepare", description: "Choose the package" },
        { id: "review", label: "Review", description: "Check the details" },
        { id: "release", label: "Release", description: "Publish when ready" },
      ]}
    />
  );
}

export function AnchorNavDemo() {
  return (
    <div>
      <AnchorNav
        items={[
          { id: "anchor-intro", label: "Introduction" },
          { id: "anchor-details", label: "Details" },
        ]}
      />
      <section id="anchor-intro">
        <h3>Introduction</h3>
        <p>Navigation follows the document.</p>
      </section>
      <section id="anchor-details">
        <h3>Details</h3>
        <p>Every item is a native fragment link.</p>
      </section>
    </div>
  );
}

export function SideNavDemo() {
  return (
    <SideNav
      currentPath="/components"
      groups={[
        {
          label: "Discover",
          items: [
            { label: "Collection", href: "/components" },
            { label: "Getting started", href: "/components/getting-started" },
          ],
        },
        {
          label: "Experiment",
          items: [
            { label: "Lab", href: "/lab" },
            { label: "Studio", href: "/studio" },
          ],
        },
      ]}
    />
  );
}

export function BottomNavDemo() {
  return (
    <BottomNav
      currentPath="/components"
      items={[
        { label: "Collection", href: "/components" },
        { label: "Lab", href: "/lab" },
        { label: "Studio", href: "/studio" },
      ]}
    />
  );
}

export function ActionMenuDemo() {
  const [status, setStatus] = useState("No action selected.");
  return (
    <div>
      <ActionMenu
        items={[
          {
            id: "copy",
            label: "Duplicate record",
            onSelect: () => setStatus("Record duplicated."),
          },
          {
            id: "archive",
            label: "Archive record",
            onSelect: () => setStatus("Record archived."),
          },
          {
            id: "delete",
            label: "Delete record",
            danger: true,
            onSelect: () => setStatus("Record deleted."),
          },
        ]}
      />
      <p role="status" className="mizu-field-hint">
        {status}
      </p>
    </div>
  );
}

export function CommandPaletteDemo() {
  const [open, setOpen] = useState(false),
    [result, setResult] = useState("Choose a command.");
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open commands</Button>
      <p role="status" className="mizu-field-hint">
        {result}
      </p>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={[
          {
            id: "new",
            label: "Create a draft",
            description: "Start a new local record",
            onSelect: () => setResult("Draft created."),
          },
          {
            id: "review",
            label: "Review the release",
            description: "Open the review queue",
            onSelect: () => setResult("Review queue opened."),
          },
          {
            id: "save",
            label: "Save changes",
            shortcut: "⌘ S",
            onSelect: () => setResult("Changes saved."),
          },
        ]}
      />
    </div>
  );
}
