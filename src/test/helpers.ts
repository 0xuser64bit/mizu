import { vi } from "vitest";

export class FakeMediaQueryList implements MediaQueryList {
  matches = true;
  media: string;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null = null;
  private listeners = new Set<EventListener>();

  constructor(query: string) {
    this.media = query;
  }

  addListener(fn: EventListener) {
    this.listeners.add(fn);
  }

  removeListener(fn: EventListener) {
    this.listeners.delete(fn);
  }

  addEventListener(_type: string, fn: EventListener) {
    this.listeners.add(fn);
  }

  removeEventListener(_type: string, fn: EventListener) {
    this.listeners.delete(fn);
  }

  dispatchEvent = (): boolean => {
    this.listeners.forEach((fn) =>
      fn({ matches: this.matches, media: this.media } as MediaQueryListEvent)
    );
    return true;
  };
}

export const reduceMotionQuery = new FakeMediaQueryList("(prefers-reduced-motion: reduce)");

export function installEnvironmentMocks() {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string): MediaQueryList =>
      query.includes("prefers-reduced-motion")
        ? reduceMotionQuery
        : new FakeMediaQueryList(query),
  });

  installClipboardMock();
}

export function installClipboardMock() {
  Object.defineProperty(navigator, "clipboard", {
    writable: true,
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
}
