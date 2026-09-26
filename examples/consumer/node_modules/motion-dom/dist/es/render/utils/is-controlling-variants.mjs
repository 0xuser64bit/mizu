import { isAnimationControls } from './is-animation-controls.mjs';
import { isVariantLabel } from './is-variant-label.mjs';
import { variantProps } from './variant-props.mjs';

function isControllingVariants(props) {
    if (isAnimationControls(props.animate))
        return true;
    for (let i = 0; i < variantProps.length; i++) {
        if (isVariantLabel(props[variantProps[i]])) {
            return true;
        }
    }
    return false;
}
function isVariantNode(props) {
    return Boolean(isControllingVariants(props) || props.variants);
}

export { isControllingVariants, isVariantNode };
//# sourceMappingURL=is-controlling-variants.mjs.map
