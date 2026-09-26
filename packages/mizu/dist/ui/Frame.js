import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function Corner({ pos }) {
    const base = {
        position: "absolute",
        width: 9,
        height: 9,
        borderColor: "var(--mizu-accent)",
    };
    const posStyle = {
        tl: { top: -1, left: -1, borderTop: "1px solid", borderLeft: "1px solid" },
        tr: { top: -1, right: -1, borderTop: "1px solid", borderRight: "1px solid" },
        bl: { bottom: -1, left: -1, borderBottom: "1px solid", borderLeft: "1px solid" },
        br: { bottom: -1, right: -1, borderBottom: "1px solid", borderRight: "1px solid" },
    };
    return _jsx("span", { "aria-hidden": true, style: { ...base, ...posStyle[pos] } });
}
export function Frame({ label, children, className = "", tone = "line", }) {
    return (_jsxs("figure", { className: className, style: {
            position: "relative",
            margin: 0,
            border: `1px solid ${tone === "line-bright" ? "var(--mizu-line-bright)" : "var(--mizu-line)"}`,
        }, children: [_jsx(Corner, { pos: "tl" }), _jsx(Corner, { pos: "tr" }), _jsx(Corner, { pos: "bl" }), _jsx(Corner, { pos: "br" }), children, label && (_jsx("figcaption", { "aria-hidden": true, style: {
                    position: "absolute",
                    top: -7,
                    left: 14,
                    padding: "0 6px",
                    background: "var(--mizu-ink)",
                    fontFamily: "var(--mizu-font-mono)",
                    fontSize: 9,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "var(--mizu-faint)",
                    whiteSpace: "nowrap",
                }, children: label }))] }));
}
//# sourceMappingURL=Frame.js.map