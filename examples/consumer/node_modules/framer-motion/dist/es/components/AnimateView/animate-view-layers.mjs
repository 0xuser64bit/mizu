import { getViewAnimations, getViewAnimationLayerInfo, getValueTransition, applyGeneratorOptions, mapEasingToNativeEasing, NativeAnimationWrapper, GroupAnimation, NativeAnimation } from 'motion-dom';
import { secondsToMilliseconds } from 'motion-utils';

/**
 * Animate the pseudo-element layers React's ViewTransition has generated for
 * a named view boundary, either retiming the browser's animations or
 * replacing its crossfade with custom keyframes.
 */
function animateViewLayers(name, animationType, { transition, onAnimationStart, onAnimationComplete, ...props }, types) {
    const layerAnimations = [];
    const definition = props[animationType];
    const { transition: typeTransition, ...values } = (typeof definition === "function" ? definition(types) : definition) ||
        {};
    const hasValues = Object.keys(values).length > 0;
    let hasMatchingAnimation = false;
    for (const viewAnimation of getViewAnimations()) {
        if (viewAnimation.playState === "finished")
            continue;
        const { effect } = viewAnimation;
        if (!(effect instanceof KeyframeEffect) || !effect.pseudoElement)
            continue;
        const info = getViewAnimationLayerInfo(effect.pseudoElement);
        if (!info || info.layer !== name)
            continue;
        hasMatchingAnimation = true;
        /**
         * Custom values replace the browser's crossfade (old/new layers).
         * The group layer carries the position/size morph, so keep it running
         * with Motion's timing.
         */
        if (hasValues && info.type !== "group") {
            viewAnimation.cancel();
        }
        else {
            const transitionName = info.type === "group" ? "layout" : "";
            let options = {
                ...getValueTransition(transition, transitionName),
                ...getValueTransition(typeTransition, transitionName),
            };
            options.duration = secondsToMilliseconds(options.duration ?? 0.3);
            options = applyGeneratorOptions(options);
            effect.updateTiming({
                delay: secondsToMilliseconds(options.delay ?? 0),
                duration: options.duration,
                easing: mapEasingToNativeEasing(options.ease, options.duration),
            });
            layerAnimations.push(new NativeAnimationWrapper(viewAnimation));
        }
    }
    if (hasValues && hasMatchingAnimation) {
        layerAnimations.push(...createLayerAnimations(name, animationType, values, transition, typeTransition));
    }
    const animation = new GroupAnimation(layerAnimations);
    let active = true;
    onAnimationStart?.(animation, animationType);
    if (onAnimationComplete) {
        animation.finished.then(() => {
            if (active)
                onAnimationComplete(animationType);
        });
    }
    return () => {
        active = false;
        animation.cancel();
    };
}
function createLayerAnimations(layerName, animationType, values, defaultTransition, transition) {
    const animations = [];
    for (const [name, value] of Object.entries(values)) {
        let keyframes = value;
        const options = {
            ...getValueTransition(defaultTransition, name),
            ...getValueTransition(transition, name),
        };
        options.duration && (options.duration = secondsToMilliseconds(options.duration));
        options.delay && (options.delay = secondsToMilliseconds(options.delay));
        if (name === "opacity" && !Array.isArray(keyframes)) {
            const initialValue = animationType === "enter" ? 0 : 1;
            keyframes = [initialValue, keyframes];
        }
        const animation = new NativeAnimation({
            ...options,
            element: document.documentElement,
            name,
            pseudoElement: `::view-transition-${animationType === "enter" ? "new" : "old"}(${layerName})`,
            keyframes,
        });
        animations.push(animation);
    }
    return animations;
}

export { animateViewLayers };
//# sourceMappingURL=animate-view-layers.mjs.map
