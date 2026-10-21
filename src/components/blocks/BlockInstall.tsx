"use client";

import { useSyncExternalStore } from "react";
import { CopyButton } from "@/mizu";
const subscribe = () => () => {};
export function BlockInstall({ id }: { id: string }) {
  const origin = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => "",
  );
  const command = `npx shadcn@latest add ${origin || "https://mizu.user64bit.world"}/r/${id}.json`;
  return (
    <div className="mizu-block-showcase-install">
      <code>{command}</code>
      <CopyButton text={command} aria-label={`Copy ${id} install command`}>
        Copy command
      </CopyButton>
    </div>
  );
}
