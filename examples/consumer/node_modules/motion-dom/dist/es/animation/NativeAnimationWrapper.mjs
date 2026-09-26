import { NativeAnimation } from './NativeAnimation.mjs';
import { notifyAnimationStart } from './utils/notify-inspector.mjs';

class NativeAnimationWrapper extends NativeAnimation {
    constructor(animation) {
        super();
        this.animation = animation;
        animation.onfinish = () => {
            this.finishedTime = this.time;
            this.notifyFinished();
        };
        /**
         * The optionless super() returns before NativeAnimation's own
         * notify, so wrapped animations (view transition cross-fades)
         * report here, after the wrapped WAAPI animation is attached.
         */
        notifyAnimationStart(this, {});
    }
}

export { NativeAnimationWrapper };
//# sourceMappingURL=NativeAnimationWrapper.mjs.map
