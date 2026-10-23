"use client";
import { useState } from "react";
import {
  Drawer,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogClose,
  Button,
  Checkbox,
  Popover,
} from "@/mizu";

export function DrawerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Filter incidents</Button>
      <Drawer open={open} onOpenChange={setOpen} label="Filters">
        <DialogClose />
        <DialogTitle>Filters</DialogTitle>
        <DialogBody>
          <Checkbox label="Only open incidents" defaultChecked />
          <Checkbox label="Assigned to me" />
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Show results</Button>
        </DialogFooter>
      </Drawer>
    </>
  );
}

export function PopoverDemo() {
  return (
    <Popover label="Columns">
      <fieldset className="mizu-form-fields">
        <legend className="mizu-field-label">Show columns</legend>
        <Checkbox label="Owner" defaultChecked />
        <Checkbox label="Severity" defaultChecked />
        <Checkbox label="Last updated" />
      </fieldset>
    </Popover>
  );
}
