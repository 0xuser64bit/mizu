import { easeInOut, isEasingArray, easingDefinitionToFunction, MotionGlobalConfig, clamp } from 'motion-utils';
import { interpolate } from '../../utils/interpolate.mjs';
import { mix } from '../../utils/mix/index.mjs';
import { defaultOffset } from '../keyframes/offsets/default.mjs';
import { convertOffsetToTimes } from '../keyframes/offsets/time.mjs';

function defaultEasing(values, easing) {
    return values.map(() => easing || easeInOut).splice(0, values.length - 1);
}
function keyframes({ duration = 300, keyframes: keyframeValues, times, ease = "easeInOut", }) {
    /**
     * Easing functions can be externally defined as strings. Here we convert them
     * into actual functions.
     */
    const easingFunctions = isEasingArray(ease)
        ? ease.map(easingDefinitionToFunction)
        : easingDefinitionToFunction(ease) || easeInOut;
    /**
     * This is the Iterator-spec return value. We ensure it's mutable rather than using a generator
     * to reduce GC during animation.
     */
    const state = {
        done: false,
        value: keyframeValues[0],
    };
    /**
     * Fast setup path for two keyframes one easing.
     */
    if (keyframeValues.length === 2 &&
        !Array.isArray(easingFunctions) &&
        (!times ||
            times.length !== 2 ||
            (times[0] === 0 && times[1] === 1))) {
        const [origin, target] = keyframeValues;
        const mixer = origin === target
            ? undefined
            : (MotionGlobalConfig.mix || mix)(origin, target);
        return {
            calculatedDuration: duration,
            next: (t) => {
                state.value = mixer
                    ? mixer(easingFunctions(duration > 0 ? clamp(0, 1, t / duration) : 1))
                    : target;
                state.done = t >= duration;
                return state;
            },
        };
    }
    /**
     * Create a times array based on the provided 0-1 offsets
     */
    const absoluteTimes = convertOffsetToTimes(
    // Only use the provided offsets if they're the correct length
    // TODO Maybe we should warn here if there's a length mismatch
    times && times.length === keyframeValues.length
        ? times
        : defaultOffset(keyframeValues), duration);
    const mapTimeToKeyframe = interpolate(absoluteTimes, keyframeValues, {
        ease: Array.isArray(easingFunctions)
            ? easingFunctions
            : defaultEasing(keyframeValues, easingFunctions),
    });
    return {
        calculatedDuration: duration,
        next: (t) => {
            state.value = mapTimeToKeyframe(t);
            state.done = t >= duration;
            return state;
        },
    };
}

export { defaultEasing, keyframes };
//# sourceMappingURL=keyframes.mjs.map
