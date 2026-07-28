import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

/**
 * jsdom does not implement matchMedia, which `useBreakpoint` depends on.
 * Tests set the viewport via `setViewport()` below; the default is mobile so
 * stepped layouts render, matching the hook's own SSR default.
 */
let isDesktop = false;

/** Switches what `useBreakpoint` reports. Call before render. */
export function setViewport(next: "mobile" | "desktop") {
  isDesktop = next === "desktop";
}

window.matchMedia = ((query: string) => ({
  media: query,
  matches: isDesktop,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

afterEach(() => {
  cleanup();
  setViewport("mobile");
});
