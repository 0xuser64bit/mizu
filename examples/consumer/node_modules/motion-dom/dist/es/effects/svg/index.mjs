import { isCSSVar } from '../../render/dom/is-css-var.mjs';
import { camelToDash } from '../../render/dom/utils/camel-to-dash.mjs';
import { cssStyleProperties } from '../../render/svg/utils/build-attrs.mjs';
import { transformProps } from '../../render/utils/keys-transform.mjs';
import { isSVGElement } from '../../utils/is-svg-element.mjs';
import { MotionValue } from '../../value/index.mjs';
import { numberValueTypes } from '../../value/types/maps/number.mjs';
import { addAttrValue } from '../attr/index.mjs';
import { addStyleValue, readStyleValue } from '../style/index.mjs';
import { createSelectorEffect } from '../utils/create-dom-effect.mjs';
import { createEffect } from '../utils/create-effect.mjs';
import { frame } from '../../frameloop/frame.mjs';

function addSVGPathValue(element, state, key, value) {
    frame.render(() => element.setAttribute("pathLength", "1"));
    if (key === "pathOffset") {
        return state.set(key, value, () => {
            // Use unitless value to avoid Safari zoom bug
            const offset = value.get();
            element.setAttribute("stroke-dashoffset", `${-offset}`);
        });
    }
    else {
        if (!state.get("stroke-dasharray")) {
            state.set("stroke-dasharray", new MotionValue("1 1"), () => {
                const pathLength = state.get("pathLength")?.get() ?? 1;
                const pathSpacing = state.get("pathSpacing")?.get();
                // Use unitless values to avoid Safari zoom bug
                element.setAttribute("stroke-dasharray", `${pathLength} ${pathSpacing ?? 1 - Number(pathLength)}`);
            });
        }
        return state.set(key, value, undefined, state.get("stroke-dasharray"));
    }
}
const addSVGValue = (element, state, key, value) => {
    if (key.startsWith("path")) {
        return addSVGPathValue(element, state, key, value);
    }
    else if (key.startsWith("attr")) {
        return addAttrValue(element, state, key, value, convertAttrKey(key));
    }
    const handler = isCSSVar(key) || key in element.style ? addStyleValue : addAttrValue;
    return handler(element, state, key, value);
};
/**
 * Reads the current value of `key` from an SVG element as the origin of
 * an animation, as the SVG VisualElement does: transforms start from
 * their defaults, CSS variables and the few CSS-only properties come from
 * computed style
 * and everything else is read from the attribute, dash-cased
 * (`strokeWidth` -> `stroke-width`) or, failing that, as written
 * (`baseFrequency`).
 */
const readSVGValue = (element, key) => {
    if (transformProps.has(key)) {
        return numberValueTypes[key]?.default || 0;
    }
    if (isCSSVar(key) || cssStyleProperties.includes(key)) {
        return readStyleValue(element, key);
    }
    key = convertAttrKey(key);
    return (element.getAttribute(camelToDash(key)) ??
        element.getAttribute(key) ??
        undefined);
};
/**
 * The per-element effect `animate()` binds through, so SVG values share
 * state with a direct `svgEffect()` call.
 */
const svgSubjectEffect = /*@__PURE__*/ createEffect(addSVGValue, {
    test: isSVGElement,
    read: readSVGValue,
});
const svgEffect = /*@__PURE__*/ createSelectorEffect(svgSubjectEffect);
function convertAttrKey(key) {
    return key.replace(/^attr([A-Z])/, (_, firstChar) => firstChar.toLowerCase());
}

export { addSVGValue, readSVGValue, svgEffect, svgSubjectEffect };
//# sourceMappingURL=index.mjs.map
