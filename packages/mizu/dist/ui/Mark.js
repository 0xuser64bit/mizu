import { jsx as _jsx } from "react/jsx-runtime";
const TONES = {
    accent: "var(--mizu-accent)",
    paper: "var(--mizu-paper)",
    muted: "var(--mizu-muted)",
    line: "var(--mizu-line-bright)",
};
export function Mark({ size = 6, tone = "accent", className = "", style, }) {
    return (_jsx("span", { "aria-hidden": true, className: className, style: {
            display: "inline-block",
            width: size,
            height: size,
            flexShrink: 0,
            background: TONES[tone],
            transform: "rotate(45deg)",
            ...style,
        } }));
}
//# sourceMappingURL=Mark.js.map