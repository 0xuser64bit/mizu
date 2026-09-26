import React, { PropsWithChildren } from 'react';
import { Transition, TargetAndTransition, AnimationPlaybackControls } from 'motion-dom';

type ViewAnimationType = "enter" | "exit" | "share" | "update";
type ViewAnimationStartCallback = (animation: AnimationPlaybackControls, type: ViewAnimationType) => void;
type ViewAnimationCompleteCallback = (type: ViewAnimationType) => void;
interface ViewAnimationOptions {
    transition?: Transition;
    enter?: TargetAndTransition | ((types: string[]) => TargetAndTransition);
    exit?: TargetAndTransition | ((types: string[]) => TargetAndTransition);
    share?: TargetAndTransition | ((types: string[]) => TargetAndTransition);
    update?: TargetAndTransition | ((types: string[]) => TargetAndTransition);
    onAnimationStart?: ViewAnimationStartCallback;
    onAnimationComplete?: ViewAnimationCompleteCallback;
}
interface AnimateViewProps extends ViewAnimationOptions {
    name?: string;
}

/**
 * Animate enter, exit, update and shared view transitions.
 * Requires React and React DOM 19.3 or later.
 */
declare function AnimateView({ children, ...props }: PropsWithChildren<AnimateViewProps>): React.ReactElement;

export { AnimateView, type AnimateViewProps, type ViewAnimationCompleteCallback, type ViewAnimationStartCallback, type ViewAnimationType };
