"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Mark } from "../ui/Mark";
export function Marquee({ children, duration = 42, pauseOnHover = true, separator = true, label, className = "", }) {
    const reduce = useReducedMotion();
    const [hover, setHover] = useState(false);
    const row = (hidden) => (_jsxs("div", { "aria-hidden": hidden, style: { display: "flex", flexShrink: 0, alignItems: "center" }, children: [children, separator && (_jsx("span", { style: { display: "inline-flex", padding: "0 28px" }, children: _jsx(Mark, { size: 6 }) }))] }));
    return (_jsx("div", { className: className, role: "marquee", "aria-label": label, style: { overflow: "hidden", display: "flex" }, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), children: _jsxs(motion.div, { style: { display: "flex", width: "max-content", willChange: "transform" }, animate: reduce
                ? { x: "0%" }
                : { x: ["0%", "-50%"], animationPlayState: pauseOnHover && hover ? "paused" : "running" }, transition: reduce ? { duration: 0 } : { duration, repeat: Infinity, ease: "linear" }, children: [row(false), row(true)] }) }));
}
//# sourceMappingURL=Marquee.js.map