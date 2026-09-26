"use client";
import { jsx } from 'react/jsx-runtime';
import React__default, { useInsertionEffect } from 'react';
import { animateViewLayers } from './animate-view-layers.mjs';
import { useResetViewTransitions } from './hooks/use-reset-view-transitions.mjs';
import { sharedProps } from './shared-props.mjs';

// Keep the entry point importable with React 18 and its type definitions.
const ViewTransition = React__default.ViewTransition;
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
    useInsertionEffect(() => {
        if (!name)
            return;
        sharedProps.set(name, props);
        return () => {
            if (sharedProps.get(name) === props)
                sharedProps.delete(name);
        };
    });
    const createAnimation = (type) => ({ name: viewName }, types) => animateViewLayers(viewName, type, sharedProps.get(viewName) || props, types);
    return (jsx(ViewTransition, { name: name, onEnter: createAnimation("enter"), onExit: createAnimation("exit"), onShare: createAnimation("share"), onUpdate: createAnimation("update"), children: children }));
}

export { AnimateView };
//# sourceMappingURL=index.mjs.map
