import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Mark } from "./Mark";
const TONES = {
    paper: { color: "var(--mizu-paper)", border: "var(--mizu-line-bright)" },
    muted: { color: "var(--mizu-muted)", border: "var(--mizu-line)" },
    accent: { color: "var(--mizu-accent)", border: "var(--mizu-accent)" },
    line: { color: "var(--mizu-faint)", border: "var(--mizu-line)" },
};
export function Badge({ children, tone = "muted", diamond = true, className = "", }) {
    const t = TONES[tone];
    return (_jsxs("span", { className: className, style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 10px",
            border: `1px solid ${t.border}`,
            fontFamily: "var(--mizu-font-mono)",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: t.color,
            whiteSpace: "nowrap",
        }, children: [diamond && _jsx(Mark, { size: 4, tone: tone === "accent" ? "accent" : "line" }), children] }));
}
//# sourceMappingURL=Badge.js.map