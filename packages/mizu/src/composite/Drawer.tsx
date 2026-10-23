"use client";

import type { ComponentProps } from "react";
import { Dialog } from "./Dialog.tsx";

export type DrawerSide = "right" | "left" | "bottom";

export function Drawer({
  side = "right",
  className = "",
  ...props
}: ComponentProps<typeof Dialog> & { side?: DrawerSide }) {
  return (
    <Dialog
      {...props}
      className={`mizu-drawer mizu-drawer--${side} ${className}`}
    />
  );
}
