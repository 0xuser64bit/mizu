import { sanitize } from '../../value/types/utils/sanitize.mjs';
import { getMixer } from './complex.mjs';
import { mixNumber } from './number.mjs';

/**
 * A single number with an optional unit, e.g. "50%", "-10px", ".5em".
 * Exponents don't match, so they fall through to the complex mixer.
 */
const unitValue = /^(-?(?:\d+(?:\.\d*)?|\.\d+))([a-z%]*)$/iu;
/**
 * Most CSS values Motion mixes are a single number with a unit. Mixing
 * these directly produces the same output as the complex mixer
 * ("25%", "0.33333px") without tokenising both strings.
 */
function mixUnit(from, to) {
    const a = unitValue.exec(from);
    if (!a)
        return;
    const b = unitValue.exec(to);
    if (!b || a[2] !== b[2])
        return;
    const unit = a[2];
    const origin = parseFloat(a[1]);
    const target = parseFloat(b[1]);
    return (p) => sanitize(mixNumber(origin, target, p)) + unit;
}
function mix(from, to, p) {
    if (typeof from === "number" &&
        typeof to === "number" &&
        typeof p === "number") {
        return mixNumber(from, to, p);
    }
    if (typeof from === "string" && typeof to === "string") {
        const mixer = mixUnit(from, to);
        if (mixer)
            return mixer;
    }
    const mixer = getMixer(from);
    return mixer(from, to);
}

export { mix };
//# sourceMappingURL=index.mjs.map
