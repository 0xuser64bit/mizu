import { transformValueTypes } from '../../value/types/maps/transform.mjs';
import { getValueAsType } from '../../value/types/utils/get-as-type.mjs';

const translateAlias = {
    x: "translateX",
    y: "translateY",
    z: "translateZ",
    transformPerspective: "perspective",
};
/**
 * Cache of `translateX(`-style openers so each render is a few string
 * concatenations rather than a template per transform.
 */
const openers = {};
function buildTransform(state) {
    let transform = "";
    const { transformKeys: keys = [], transformValues: values = {} } = state;
    /**
     * Loop over the bound transforms in order, adding the ones that
     * aren't at their default value to the transform string.
     */
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = values[key].get();
        if (value === undefined)
            continue;
        const parsed = typeof value === "number" ? value : parseFloat(value);
        if (parsed !== (key.startsWith("scale") ? 1 : 0)) {
            transform +=
                (transform && " ") +
                    (openers[key] ||
                        (openers[key] = (translateAlias[key] || key) + "(")) +
                    getValueAsType(value, transformValueTypes[key]) +
                    ")";
        }
    }
    // See build-transform.ts: additive `rotate()` so user `rotate` isn't
    // clobbered. Not a `transformPropOrder` slot.
    const pathRotation = state.get("pathRotation")?.get();
    if (pathRotation) {
        transform +=
            (transform && " ") +
                "rotate(" +
                getValueAsType(pathRotation, transformValueTypes.pathRotation) +
                ")";
    }
    return transform || "none";
}

export { buildTransform };
//# sourceMappingURL=transform.mjs.map
