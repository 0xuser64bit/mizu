import { motionValue } from './index.mjs';
import { FollowAnimation } from '../animation/FollowAnimation.mjs';
import { isMotionValue } from './utils/is-motion-value.mjs';

/**
 * Create a `MotionValue` that animates to its latest value using any transition type.
 * Can either be a value or track another `MotionValue`.
 *
 * ```jsx
 * const x = motionValue(0)
 * const y = followValue(x, { type: "spring", stiffness: 300 })
 * // or with tween
 * const z = followValue(x, { type: "tween", duration: 0.5, ease: "easeOut" })
 * ```
 *
 * @param source - Initial value or MotionValue to track
 * @param options - Animation transition options
 * @returns `MotionValue`
 *
 * @public
 */
function followValue(source, options) {
    const initialValue = isMotionValue(source) ? source.get() : source;
    const value = motionValue(initialValue);
    attachFollow(value, source, options);
    return value;
}
/**
 * Attach an animation to a MotionValue that will animate whenever the value changes.
 * Similar to attachSpring but supports any transition type (spring, tween, inertia, etc.)
 *
 * @param value - The MotionValue to animate
 * @param source - Initial value or MotionValue to track
 * @param options - Animation transition options
 * @returns Cleanup function
 *
 * @public
 */
function attachFollow(value, source, options = {}) {
    const initialValue = value.get();
    let activeAnimation = null;
    let set;
    const unit = typeof initialValue === "string"
        ? initialValue.replace(/[\d.-]/g, "")
        : undefined;
    const onUpdate = (v) => set((unit ? v + unit : v));
    const onPlay = () => value["events"].animationStart?.notify();
    const stopAnimation = () => {
        if (activeAnimation) {
            activeAnimation.stop();
            activeAnimation = null;
        }
        value.animation = undefined;
    };
    value.attach((v, safeSet) => {
        set = safeSet;
        const target = asNumber(v);
        if (activeAnimation?.state === "running") {
            /**
             * Steer the running animation rather than replacing it. This
             * keeps its completion promise and uses its analytical velocity
             * for accuracy, preventing systematic velocity loss at high
             * frame rates (240hz+).
             */
            activeAnimation.setTarget(target, options.velocity);
            return;
        }
        const current = asNumber(value.get());
        const velocity = activeAnimation
            ? activeAnimation.getGeneratorVelocity()
            : value.getVelocity();
        stopAnimation();
        // Don't animate if we're already at the target
        if (current === target)
            return;
        const animationOptions = {
            keyframes: [current, target],
            velocity,
            // Default to spring if no type specified (matches useSpring behavior)
            type: "spring",
            restDelta: 0.001,
            restSpeed: 0.01,
            ...options,
            onUpdate,
        };
        const animation = (activeAnimation = new FollowAnimation({
            ...animationOptions,
            onPlay,
        }));
        value.animation = animation;
        animation.then(() => {
            // Ignore if this animation has since been replaced
            if (activeAnimation !== animation)
                return;
            activeAnimation = null;
            value.animation = undefined;
            value["events"].animationComplete?.notify();
        });
    }, stopAnimation);
    if (isMotionValue(source)) {
        let skipNextAnimation = options.skipInitialAnimation === true;
        const removeSourceOnChange = source.on("change", (v) => {
            if (skipNextAnimation) {
                skipNextAnimation = false;
                value.jump(parseValue(v, unit), false);
            }
            else {
                value.set(parseValue(v, unit));
            }
        });
        const removeValueOnDestroy = value.on("destroy", removeSourceOnChange);
        return () => {
            removeSourceOnChange();
            removeValueOnDestroy();
        };
    }
    return stopAnimation;
}
function parseValue(v, unit) {
    return unit ? v + unit : v;
}
function asNumber(v) {
    return typeof v === "number" ? v : parseFloat(v);
}

export { attachFollow, followValue };
//# sourceMappingURL=follow-value.mjs.map
