import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { installEnvironmentMocks, reduceMotionQuery } from "./helpers";

afterEach(() => {
  cleanup();
  reduceMotionQuery.matches = true;
  reduceMotionQuery.dispatchEvent();
});

// Force motion's rAF animation driver instead of happy-dom WAAPI.
// happy-dom's Animation.cancel() rejects the finished promise, so every
// animation canceled at unmount surfaces as an unhandled AbortError.
// Unit tests assert behavior, not rendered frames — WAAPI is irrelevant here.
if (typeof Element !== "undefined" && "animate" in Element.prototype) {
  // @ts-expect-error — intentionally removing WAAPI support in tests
  delete Element.prototype.animate;
}

installEnvironmentMocks();
