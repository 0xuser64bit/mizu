"use client";
import { createContext, useContext, type ReactNode } from "react";
import {
  MotionConfig,
  useReducedMotion as usePlatformReducedMotion,
} from "motion/react";
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
export function useReducedMotion() {
  const local = useContext(Preference),
    platform = usePlatformReducedMotion();
  return local ?? platform;
}
