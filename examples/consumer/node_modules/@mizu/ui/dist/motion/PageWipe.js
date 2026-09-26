"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useRef, useState, } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_WIPE } from "./easings";
const WIPE_MS = 1050;
const MIDPOINT_MS = 500;
const PageWipeContext = createContext(null);
export function usePageWipe() {
    const ctx = useContext(PageWipeContext);
    if (!ctx)
        throw new Error("usePageWipe must be used within <PageWipeProvider>");
    return ctx;
}
export function PageWipeProvider({ children }) {
    const reduce = useReducedMotion();
    const [active, setActive] = useState(null);
    const resolver = useRef(null);
    const busy = useRef(false);
    const wipe = useCallback((label = "") => {
        if (reduce)
            return Promise.resolve();
        if (busy.current)
            return new Promise(() => { });
        busy.current = true;
        return new Promise((resolve) => {
            resolver.current = () => {
                resolve();
                resolver.current = null;
            };
            setActive({ label, id: Date.now() });
            window.setTimeout(() => resolver.current?.(), MIDPOINT_MS);
        });
    }, [reduce]);
    const finish = useCallback(() => {
        window.setTimeout(() => {
            setActive(null);
            busy.current = false;
        }, 60);
    }, []);
    return (_jsxs(PageWipeContext.Provider, { value: { wipe }, children: [children, _jsx(AnimatePresence, { children: active && (_jsx(motion.div, { "aria-hidden": true, className: "mizu-wipe", style: {
                        position: "fixed",
                        inset: 0,
                        zIndex: "var(--mizu-z-wipe)",
                        background: "var(--mizu-ink-2)",
                        borderRight: "2px solid var(--mizu-accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                    }, initial: { x: "-101%" }, animate: { x: "101%" }, exit: { opacity: 0 }, transition: { duration: WIPE_MS / 1000, ease: EASE_WIPE }, onAnimationComplete: finish, children: active.label && (_jsx(motion.span, { style: {
                            fontFamily: "var(--mizu-font-mono)",
                            fontSize: 12,
                            letterSpacing: "0.45em",
                            textTransform: "uppercase",
                            color: "var(--mizu-paper)",
                            opacity: 0.7,
                        }, initial: { opacity: 0, y: 14 }, animate: { opacity: [0, 1, 1, 0], y: 0 }, transition: { duration: WIPE_MS / 1000, times: [0, 0.22, 0.72, 1], ease: "linear" }, children: active.label })) }, active.id)) })] }));
}
//# sourceMappingURL=PageWipe.js.map