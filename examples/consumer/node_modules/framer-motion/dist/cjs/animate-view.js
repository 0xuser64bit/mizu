'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var motionDom = require('motion-dom');
var motionUtils = require('motion-utils');

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
    for (const viewAnimation of motionDom.getViewAnimations()) {
        if (viewAnimation.playState === "finished")
            continue;
        const { effect } = viewAnimation;
        if (!(effect instanceof KeyframeEffect) || !effect.pseudoElement)
            continue;
        const info = motionDom.getViewAnimationLayerInfo(effect.pseudoElement);
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
                ...motionDom.getValueTransition(transition, transitionName),
                ...motionDom.getValueTransition(typeTransition, transitionName),
            };
            options.duration = motionUtils.secondsToMilliseconds(options.duration ?? 0.3);
            options = motionDom.applyGeneratorOptions(options);
            effect.updateTiming({
                delay: motionUtils.secondsToMilliseconds(options.delay ?? 0),
                duration: options.duration,
                easing: motionDom.mapEasingToNativeEasing(options.ease, options.duration),
            });
            layerAnimations.push(new motionDom.NativeAnimationWrapper(viewAnimation));
        }
    }
    if (hasValues && hasMatchingAnimation) {
        layerAnimations.push(...createLayerAnimations(name, animationType, values, transition, typeTransition));
    }
    const animation = new motionDom.GroupAnimation(layerAnimations);
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
            ...motionDom.getValueTransition(defaultTransition, name),
            ...motionDom.getValueTransition(transition, name),
        };
        options.duration && (options.duration = motionUtils.secondsToMilliseconds(options.duration));
        options.delay && (options.delay = motionUtils.secondsToMilliseconds(options.delay));
        if (name === "opacity" && !Array.isArray(keyframes)) {
            const initialValue = animationType === "enter" ? 0 : 1;
            keyframes = [initialValue, keyframes];
        }
        const animation = new motionDom.NativeAnimation({
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

let hasInsertedTransitionResetStyle = false;
function useResetViewTransitions() {
    React.useInsertionEffect(() => {
        if (hasInsertedTransitionResetStyle)
            return;
        hasInsertedTransitionResetStyle = true;
        const style = document.createElement("style");
        style.textContent = `
    ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) {
        animation-timing-function: linear !important;
    }
    `;
        document.head.appendChild(style);
    }, []);
}

const sharedProps = new Map();

// Keep the entry point importable with React 18 and its type definitions.
const ViewTransition = React.ViewTransition;
/**
 * Animate enter, exit, update and shared view transitions.
 * Requires React and React DOM 19.3 or later.
 */
function AnimateView({ children, ...props }) {
    if (!ViewTransition) {
        throw new Error("AnimateView requires React 19.3 or later.");
    }
    useResetViewTransitions();
    const { name } = props;
    React.useInsertionEffect(() => {
        if (!name)
            return;
        sharedProps.set(name, props);
        return () => {
            if (sharedProps.get(name) === props)
                sharedProps.delete(name);
        };
    });
    const createAnimation = (type) => ({ name: viewName }, types) => animateViewLayers(viewName, type, sharedProps.get(viewName) || props, types);
    return (jsxRuntime.jsx(ViewTransition, { name: name, onEnter: createAnimation("enter"), onExit: createAnimation("exit"), onShare: createAnimation("share"), onUpdate: createAnimation("update"), children: children }));
}

exports.AnimateView = AnimateView;
//# sourceMappingURL=animate-view.js.map
