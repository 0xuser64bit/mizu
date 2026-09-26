"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { motion } from "motion/react";
import { EASE_EXPO } from "./easings";
export function Reveal({ children, delay = 0, y = 32, x = 0, duration = 0.95, once = true, className = "", }) {
    return (_jsx(motion.div, { className: className, initial: { opacity: 0, y, x }, whileInView: { opacity: 1, y: 0, x: 0 }, viewport: { once, margin: "-70px" }, transition: { duration, delay, ease: EASE_EXPO }, children: children }));
}
//# sourceMappingURL=Reveal.js.map