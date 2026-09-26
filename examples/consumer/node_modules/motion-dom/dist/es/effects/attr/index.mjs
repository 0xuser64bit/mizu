import { camelToDash } from '../../render/dom/utils/camel-to-dash.mjs';
import { numberValueTypes } from '../../value/types/maps/number.mjs';
import { getValueAsType } from '../../value/types/utils/get-as-type.mjs';
import { createSelectorEffect } from '../utils/create-dom-effect.mjs';
import { createEffect } from '../utils/create-effect.mjs';

function canSetAsProperty(element, name) {
    if (!(name in element))
        return false;
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), name) ||
        Object.getOwnPropertyDescriptor(element, name);
    // Check if it has a setter
    return descriptor && typeof descriptor.set === "function";
}
/**
 * `name` is the attribute written when it differs from the key the value
 * is stored under, e.g. `attrX` -> `x`. Numbers take the attribute's
 * default unit (`x: 100` -> `"100px"`), as they do when key and name match.
 */
const addAttrValue = (element, state, key, value, name = key) => {
    const isProp = canSetAsProperty(element, name);
    if (!isProp && (name.startsWith("data") || name.startsWith("aria"))) {
        name = camelToDash(name);
    }
    const type = numberValueTypes[key] || numberValueTypes[name];
    /**
     * Set attribute directly via property if available
     */
    const render = isProp
        ? () => {
            element[name] = getValueAsType(value.get(), numberValueTypes[key]);
        }
        : () => {
            const v = getValueAsType(value.get(), type);
            if (v === null || v === undefined) {
                element.removeAttribute(name);
            }
            else {
                element.setAttribute(name, String(v));
            }
        };
    return state.set(key, value, render);
};
const attrEffect = /*@__PURE__*/ createSelectorEffect(
/*@__PURE__*/ createEffect(addAttrValue));

export { addAttrValue, attrEffect };
//# sourceMappingURL=index.mjs.map
