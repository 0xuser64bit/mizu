import { isCSSVar } from '../../render/dom/is-css-var.mjs';
import { readTransformValue } from '../../render/dom/parse-transform.mjs';
import { transformProps, transformPropOrder } from '../../render/utils/keys-transform.mjs';
import { isHTMLElement } from '../../utils/is-html-element.mjs';
import { isSVGElement } from '../../utils/is-svg-element.mjs';
import { MotionValue } from '../../value/index.mjs';
import { numberValueTypes } from '../../value/types/maps/number.mjs';
import { getValueAsType } from '../../value/types/utils/get-as-type.mjs';
import { createSelectorEffect } from '../utils/create-dom-effect.mjs';
import { createEffect } from '../utils/create-effect.mjs';
import { buildTransform } from './transform.mjs';

const originProps = new Set(["originX", "originY", "originZ"]);
/**
 * A bound value in its default unit, e.g. `originX: 50` -> `"50%"`.
 */
const styleValue = (state, key) => getValueAsType(state.get(key)?.get(), numberValueTypes[key]);
const addStyleValue = (element, state, key, value) => {
    let render = undefined;
    let computed = undefined;
    if (transformProps.has(key)) {
        if (key !== "pathRotation") {
            const keys = (state.transformKeys ?? (state.transformKeys = []));
            (state.transformValues ?? (state.transformValues = {}))[key] = value;
            if (!keys.includes(key)) {
                keys.push(key);
                keys.sort((a, b) => transformPropOrder.indexOf(a) -
                    transformPropOrder.indexOf(b));
            }
        }
        if (!state.get("transform")) {
            // If this is an HTML element, we need to set the transform-box to fill-box
            // to normalise the transform relative to the element's bounding box
            if (!isHTMLElement(element) && !state.get("transformBox")) {
                addStyleValue(element, state, "transformBox", new MotionValue("fill-box"));
            }
            state.set("transform", new MotionValue("none"), () => {
                element.style.transform = buildTransform(state);
            });
        }
        computed = state.get("transform");
    }
    else if (originProps.has(key)) {
        if (!state.get("transformOrigin")) {
            state.set("transformOrigin", new MotionValue(""), () => {
                const originX = styleValue(state, "originX") ?? "50%";
                const originY = styleValue(state, "originY") ?? "50%";
                const originZ = styleValue(state, "originZ") ?? 0;
                element.style.transformOrigin = `${originX} ${originY} ${originZ}`;
            });
        }
        computed = state.get("transformOrigin");
    }
    else if (isCSSVar(key)) {
        render = () => {
            element.style.setProperty(key, value.get());
        };
    }
    else {
        render = () => {
            element.style[key] = getValueAsType(value.get(), numberValueTypes[key]);
        };
    }
    return state.set(key, value, render, computed);
};
const isStyleSubject = (subject) => isHTMLElement(subject) || isSVGElement(subject);
/**
 * Reads the current value of a style from the element, as the initial
 * keyframe when `animate()` targets an element via this effect. Transforms
 * are parsed out of the computed matrix; everything else is the computed
 * style. Units aren't converted to match the target keyframes. A style
 * the browser can't report is 0, as a VisualElement reports it.
 */
const readStyleValue = (element, key) => {
    if (transformProps.has(key)) {
        return readTransformValue(element, key);
    }
    const computedStyle = getComputedStyle(element);
    const value = isCSSVar(key)
        ? computedStyle.getPropertyValue(key)
        : computedStyle[key];
    return (typeof value === "string" && value.trim()) || 0;
};
/**
 * The per-element effect `animate()` binds through, so HTML values share
 * state with a direct `styleEffect()` call. The exported `styleEffect`
 * is this wrapped to also accept selectors.
 */
const styleSubjectEffect = /*@__PURE__*/ createEffect(addStyleValue, {
    test: isStyleSubject,
    read: readStyleValue,
});
const styleEffect = /*@__PURE__*/ createSelectorEffect(styleSubjectEffect);

export { addStyleValue, readStyleValue, styleEffect, styleSubjectEffect };
//# sourceMappingURL=index.mjs.map
