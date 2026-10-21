import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { installEnvironmentMocks, reduceMotionQuery } from "./helpers";

afterEach(() => {
  cleanup();
  reduceMotionQuery.matches = true;
  reduceMotionQuery.dispatchEvent();
});

// happy-dom's Animation.cancel() rejects finished with AbortError at unmount.
if (typeof Element !== "undefined" && "animate" in Element.prototype) {
  // @ts-expect-error — intentionally removing WAAPI support in tests
  delete Element.prototype.animate;
}

installEnvironmentMocks();
