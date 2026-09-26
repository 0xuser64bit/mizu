"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { motion, useReducedMotion } from "motion/react";
export function Spinner({ size = 14, tone = "accent", label = "Loading", className = "", }) {
    const reduce = useReducedMotion();
    const color = tone === "accent" ? "var(--mizu-accent)" : tone === "paper" ? "var(--mizu-paper)" : "var(--mizu-muted)";
    return (_jsx("span", { role: "status", "aria-label": label, className: className, style: { display: "inline-flex" }, children: _jsx(motion.span, { "aria-hidden": true, style: { width: size, height: size, background: color, transform: "rotate(45deg)" }, animate: reduce ? { rotate: 45 } : { rotate: 405 }, transition: reduce ? { duration: 0 } : { duration: 0.9, repeat: Infinity, ease: "linear" } }) }));
}
//# sourceMappingURL=Spinner.js.map