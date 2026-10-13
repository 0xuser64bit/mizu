"use client";
import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { MotionConfig } from "motion/react";
const Preference = createContext<boolean | undefined>(undefined);
/** Local override for previews and products; the default always follows the OS. */
export function MotionPreferences({
  reduced,
  children,
}: {
  reduced?: boolean;
  children: ReactNode;
}) {
  return (
    <Preference.Provider value={reduced}>
      <MotionConfig
        reducedMotion={
          reduced === undefined ? "user" : reduced ? "always" : "never"
        }
      >
        <div
          data-motion={reduced ? "reduced" : undefined}
          style={{ display: "contents" }}
        >
          {children}
        </div>
      </MotionConfig>
    </Preference.Provider>
  );
}
const QUERY = "(prefers-reduced-motion: reduce)";
function subscribe(change: () => void) {
  const list = window.matchMedia(QUERY);
  list.addEventListener("change", change);
  return () => list.removeEventListener("change", change);
}
/**
 * Hydration reads "no preference", as the server did, so the markup matches;
 * React then re-renders with the OS setting and follows it when it changes.
 */
export function useReducedMotion() {
  const local = useContext(Preference),
    platform = useSyncExternalStore(
      subscribe,
      () => window.matchMedia(QUERY).matches,
      () => false,
    );
  return local ?? platform;
}
