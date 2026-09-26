import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Mark } from "./Mark";
export function Rule({ label, node = true, tone = "line", className = "", }) {
    const line = (_jsx("span", { "aria-hidden": true, style: {
            flex: 1,
            height: 1,
            background: tone === "accent"
                ? "var(--mizu-accent)"
                : tone === "line-bright"
                    ? "var(--mizu-line-bright)"
                    : "var(--mizu-line)",
        } }));
    return (_jsxs("div", { role: "separator", "aria-orientation": "horizontal", className: className, style: { display: "flex", alignItems: "center", gap: 12, width: "100%" }, children: [line, node && _jsx(Mark, { size: 5, tone: tone === "accent" ? "accent" : "line" }), label && (_jsx("span", { style: {
                    fontFamily: "var(--mizu-font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "var(--mizu-faint)",
                    whiteSpace: "nowrap",
                }, children: label })), label && line] }));
}
//# sourceMappingURL=Rule.js.map