import { parseValueFromTransform } from '../../../render/dom/parse-transform.mjs';
import { transformPropOrder } from '../../../render/utils/keys-transform.mjs';
import { number } from '../../../value/types/numbers/index.mjs';
import { px } from '../../../value/types/numbers/units.mjs';

const isNumOrPxType = (v) => v === number || v === px;
const transformKeys = new Set(["x", "y", "z"]);
const nonTranslationalTransformKeys = transformPropOrder.filter((key) => !transformKeys.has(key));
/**
 * Reset any bounding box-changing transforms so the element can be
 * measured. Returns the values to restore. Values already at their
 * default don't change the box, so they're left alone: an element with
 * only `rotate: 0` doesn't need to be re-rendered before measuring.
 */
function removeNonTranslationalTransform(visualElement) {
    const removedTransforms = [];
    nonTranslationalTransformKeys.forEach((key) => {
        const value = visualElement.getValue(key);
        if (value !== undefined) {
            const current = value.get();
            const reset = key.startsWith("scale") ? 1 : 0;
            if (current === reset)
                return;
            removedTransforms.push([key, current]);
            value.set(reset);
        }
    });
    return removedTransforms;
}
/**
 * Values that can only be measured from the bounding box. Elements with
 * these values need bounding box-changing transforms removed first.
 */
const boxDependentValues = new Set(["bottom", "right"]);
/**
 * Computed width/height is already in pixels and unaffected by
 * transforms. It's "auto" for elements without a layout box (e.g. inline),
 * in which case we fall back to measuring the bounding box.
 */
function measureDimension(computed, measureBox, axis, paddingStart, paddingEnd, boxSizing) {
    const px = parseFloat(computed);
    if (!isNaN(px))
        return px;
    const { min, max } = measureBox()[axis];
    const size = max - min;
    return boxSizing === "border-box"
        ? size
        : size - parseFloat(paddingStart) - parseFloat(paddingEnd);
}
const positionalValues = {
    // Dimensions
    width: ({ width, paddingLeft = "0", paddingRight = "0", boxSizing }, measureBox) => measureDimension(width, measureBox, "x", paddingLeft, paddingRight, boxSizing),
    height: ({ height, paddingTop = "0", paddingBottom = "0", boxSizing }, measureBox) => measureDimension(height, measureBox, "y", paddingTop, paddingBottom, boxSizing),
    top: ({ top }) => parseFloat(top),
    left: ({ left }) => parseFloat(left),
    bottom: ({ top }, measureBox) => {
        const { y } = measureBox();
        return parseFloat(top) + (y.max - y.min);
    },
    right: ({ left }, measureBox) => {
        const { x } = measureBox();
        return parseFloat(left) + (x.max - x.min);
    },
    // Transform
    x: ({ transform }) => parseValueFromTransform(transform, "x"),
    y: ({ transform }) => parseValueFromTransform(transform, "y"),
};
// Alias translate longform names
positionalValues.translateX = positionalValues.x;
positionalValues.translateY = positionalValues.y;

export { boxDependentValues, isNumOrPxType, positionalValues, removeNonTranslationalTransform };
//# sourceMappingURL=unit-conversion.mjs.map
