import { invariant, removeItem } from 'motion-utils';
import { positionalKeys } from '../../render/utils/keys-position.mjs';
import { motionValue } from '../../value/index.mjs';
import { animateMotionValue } from '../interfaces/motion-value.mjs';
import { frame } from '../../frameloop/frame.mjs';

/**
 * Effects registered via `animate.addEffect()`, most recent first.
 */
const effects = [];
function addEffect(effect) {
    invariant(typeof effect.test === "function" && typeof effect.read === "function", "Effects passed to animate.addEffect() need test() and read().", "effect-missing-test");
    removeEffect(effect);
    effects.unshift(effect);
}
function removeEffect(effect) {
    removeItem(effects, effect);
}
function findEffect(subject) {
    return effects.find((effect) => effect.test(subject));
}
/**
 * Animate each key in `keyframes` on the motion value `getValue` returns
 * for it. `element` is what the keyframe resolver uses to read, render
 * and measure the subject when the effect defers resolution to it.
 */
function animateValues(getValue, keyframes, transition = {}, element) {
    const animations = [];
    const { velocity } = transition;
    const reduceMotion = transition.reduceMotion ?? element?.shouldReduceMotion;
    for (const key in keyframes) {
        if (key === "transition" || key === "transitionEnd")
            continue;
        const target = keyframes[key];
        if (target === undefined)
            continue;
        const value = getValue(key);
        /**
         * If the value is already at the defined target, skip the animation.
         * We still re-assert the value via frame.update to take precedence
         * over any stale transitionEnd callbacks from previous animations.
         */
        const current = value.get();
        if (current !== undefined &&
            !value.isAnimating() &&
            !Array.isArray(target) &&
            target === current &&
            !velocity) {
            frame.update(() => value.set(target));
            continue;
        }
        value.start(animateMotionValue(key, value, target, reduceMotion && positionalKeys.has(key)
            ? { type: false }
            : transition, element));
        value.animation &&
            animations.push(value.animation);
    }
    const { transitionEnd } = keyframes;
    if (transitionEnd) {
        const applyTransitionEnd = () => frame.update(() => {
            for (const key in transitionEnd) {
                getValue(key).set(transitionEnd[key]);
            }
        });
        animations.length
            ? Promise.all(animations).then(applyTransitionEnd)
            : applyTransitionEnd();
    }
    return animations;
}
/**
 * Animate the keys of `subject` via `effect`. Motion values are created on
 * first animation and bound to the subject through the effect for the
 * rest of its life.
 *
 * Without `element`, a new value is seeded synchronously from the first
 * keyframe or `effect.read()`. With it, the value starts undefined and the
 * keyframe resolver reads the subject (batched, with unit conversion by
 * measurement) via `element`.
 */
function animateEffectSubject(effect, subject, keyframes, transition, element) {
    return animateValues((key) => {
        let value = effect.get(subject, key);
        if (!value) {
            let initial;
            if (!element) {
                const target = keyframes[key];
                initial =
                    firstKeyframe(target) ??
                        effect.read(subject, key, target);
                invariant(initial !== undefined, `"${key}" can't be read from the animated subject. Provide [from, to] keyframes.`, "effect-unreadable-value");
            }
            value = motionValue(initial, { owner: element });
            effect(subject, { [key]: value });
        }
        return value;
    }, keyframes, transition, element);
}
function firstKeyframe(target) {
    const first = Array.isArray(target) ? target[0] : undefined;
    return first === null ? undefined : first;
}

export { addEffect, animateEffectSubject, animateValues, findEffect, removeEffect };
//# sourceMappingURL=effects.mjs.map
