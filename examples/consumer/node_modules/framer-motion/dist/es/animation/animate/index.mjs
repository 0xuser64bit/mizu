import { removeEffect, addEffect, GroupAnimationWithThen } from 'motion-dom';
import { removeItem } from 'motion-utils';
import { animateSequence } from './sequence.mjs';
import { animateSubject } from './subject.mjs';

function isSequence(value) {
    return Array.isArray(value) && value.some(Array.isArray);
}
/**
 * Creates an animation function that is optionally scoped
 * to a specific element.
 */
function createScopedAnimate(options = {}) {
    const { scope, reduceMotion, skipAnimations } = options;
    /**
     * Implementation
     */
    function scopedAnimate(subjectOrSequence, optionsOrKeyframes, options) {
        let animations = [];
        let animationOnComplete;
        const inherited = {};
        if (reduceMotion !== undefined)
            inherited.reduceMotion = reduceMotion;
        if (skipAnimations !== undefined)
            inherited.skipAnimations = skipAnimations;
        if (isSequence(subjectOrSequence)) {
            const { onComplete, ...sequenceOptions } = optionsOrKeyframes || {};
            if (typeof onComplete === "function") {
                animationOnComplete = onComplete;
            }
            animations = animateSequence(subjectOrSequence, { ...inherited, ...sequenceOptions }, scope);
        }
        else {
            // Extract top-level onComplete so it doesn't get applied per-value
            const { onComplete, ...rest } = options || {};
            if (typeof onComplete === "function") {
                animationOnComplete = onComplete;
            }
            animations = animateSubject(subjectOrSequence, optionsOrKeyframes, { ...inherited, ...rest }, scope);
        }
        const animation = new GroupAnimationWithThen(animations);
        if (animationOnComplete) {
            animation.finished.then(animationOnComplete);
        }
        if (scope) {
            scope.animations.push(animation);
            animation.finished.then(() => {
                removeItem(scope.animations, animation);
            });
        }
        return animation;
    }
    return scopedAnimate;
}
const animate = Object.assign(createScopedAnimate(), {
    /**
     * Register an effect so `animate()` can animate the subjects it
     * claims, for instance `animate.addEffect(threeEffect)`. The most
     * recently added effect is tested first. DOM elements are always
     * animated directly.
     */
    addEffect,
    removeEffect,
});

export { animate, createScopedAnimate };
//# sourceMappingURL=index.mjs.map
