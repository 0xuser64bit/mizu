import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { installEnvironmentMocks, reduceMotionQuery } from "./helpers";

afterEach(() => {
  cleanup();
  reduceMotionQuery.matches = true;
  reduceMotionQuery.dispatchEvent();
});

installEnvironmentMocks();
