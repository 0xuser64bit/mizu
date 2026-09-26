import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Tooltip({ label, children, side = "top", className = "", }) {
    return (_jsxs("span", { className: `mizu-tooltip mizu-tooltip--${side} ${className}`, children: [children, _jsx("span", { role: "tooltip", className: "mizu-tooltip-bubble", children: label })] }));
}
//# sourceMappingURL=Tooltip.js.map