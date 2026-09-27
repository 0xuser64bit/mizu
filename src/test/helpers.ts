import { vi } from "vitest";

export class FakeMediaQueryList implements MediaQueryList {
  matches = true;
  media: string;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null =
    null;
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
      fn({ matches: this.matches, media: this.media } as MediaQueryListEvent),
    );
    return true;
  };
}

export const reduceMotionQuery = new FakeMediaQueryList(
  "(prefers-reduced-motion: reduce)",
);

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

/** Gives every element a measured box and a ResizeObserver that reports it. */
export function mockLayout(width = 800, height = 400) {
  const rect = vi
    .spyOn(Element.prototype, "getBoundingClientRect")
    .mockImplementation(
      () =>
        ({
          x: 0,
          y: 0,
          left: 0,
          top: 0,
          width,
          height,
          right: width,
          bottom: height,
          toJSON: () => ({}),
        }) as DOMRect,
    );
  const original = globalThis.ResizeObserver;
  globalThis.ResizeObserver = class {
    constructor(private callback: ResizeObserverCallback) {}
    observe(target: Element) {
      queueMicrotask(() =>
        this.callback(
          [{ target } as ResizeObserverEntry],
          this as unknown as ResizeObserver,
        ),
      );
    }
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  return () => {
    rect.mockRestore();
    globalThis.ResizeObserver = original;
  };
}
