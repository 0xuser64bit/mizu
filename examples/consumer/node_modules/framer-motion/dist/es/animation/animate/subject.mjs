import { animateSingleValue, animateElement, visualElementStore, animateEffectSubject, propEffect, findEffect, isMotionValue } from 'motion-dom';
import { invariant } from 'motion-utils';
import { isDOMKeyframes } from '../utils/is-dom-keyframes.mjs';
import { resolveSubjects } from './resolve-subjects.mjs';

function isSingleValue(subject, keyframes) {
    return (isMotionValue(subject) ||
        typeof subject === "number" ||
        (typeof subject === "string" && !isDOMKeyframes(keyframes)));
}
/**
 * Implementation
 */
function animateSubject(subject, keyframes, options, scope) {
    const animations = [];
    if (isSingleValue(subject, keyframes)) {
        animations.push(animateSingleValue(subject, isDOMKeyframes(keyframes)
            ? keyframes.default || keyframes
            : keyframes, options ? options.default || options : options));
    }
    else {
        // Gracefully handle null/undefined subjects (e.g., from querySelector returning null)
        if (subject == null) {
            return animations;
        }
        const subjects = resolveSubjects(subject, keyframes, scope);
        const numSubjects = subjects.length;
        invariant(Boolean(numSubjects), "No valid elements provided.", "no-valid-elements");
        for (let i = 0; i < numSubjects; i++) {
            const thisSubject = subjects[i];
            const transition = { ...options };
            /**
             * Resolve stagger function if provided.
             */
            if ("delay" in transition &&
                typeof transition.delay === "function") {
                transition.delay = transition.delay(i, numSubjects);
            }
            if (thisSubject instanceof Element) {
                /**
                 * An element already owned by a VisualElement (a <motion.*>
                 * component or animateLayout()) animates its values so they
                 * share one renderer. Anything else is driven through
                 * styleEffect (or svgEffect) and the DOM keyframe resolver,
                 * without creating a VisualElement.
                 */
                animations.push(...animateElement(thisSubject, keyframes, transition, visualElementStore.get(thisSubject)));
            }
            else {
                /**
                 * Registered effects (animate.addEffect) claim non-DOM
                 * subjects before we fall back to writing plain properties.
                 */
                animations.push(...animateEffectSubject(findEffect(thisSubject) ?? propEffect, thisSubject, keyframes, transition));
            }
        }
    }
    return animations;
}

export { animateSubject };
//# sourceMappingURL=subject.mjs.map
