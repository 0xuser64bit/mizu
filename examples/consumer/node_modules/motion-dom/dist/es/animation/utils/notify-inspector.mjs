import { frameData } from '../../frameloop/frame.mjs';
import { time } from '../../frameloop/sync-time.mjs';

function baseRecord(kind, animation) {
    return {
        kind,
        animation,
        timestamp: time.now(),
        frameTimestamp: frameData.timestamp,
        frameIsProcessing: frameData.isProcessing,
    };
}
/**
 * Notify an optional inspector without adding a public Motion API.
 *
 * The record is a raw firehose: the live animation handle, the concrete
 * animation's internal options object untouched (timing fields in
 * internal milliseconds, name/keyframes/element/motionValue still
 * attached), a timestamp and the raw frameloop state at notify time.
 * All interpretation belongs to the consumer behind
 * globalThis.__MOTION_INSPECT__.
 */
function notifyAnimationStart(animation, options, transition) {
    const notify = globalThis.__MOTION_INSPECT__;
    if (!notify)
        return;
    try {
        notify({
            ...baseRecord("animation-start", animation),
            options: transition ? { ...options, ...transition } : options,
        });
    }
    catch { }
}
/**
 * Layout animations drive a projection node's progress rather than a
 * property, so the record forwards the live node itself: it carries the
 * DOM instance, the layout options (layoutId) and the progress handle.
 * Fired inside the frame.update that starts the animation, so nodes
 * animating in the same layout commit share frameTimestamp.
 */
function notifyLayoutAnimationStart(animation, node) {
    const notify = globalThis.__MOTION_INSPECT__;
    if (!notify)
        return;
    try {
        notify({
            ...baseRecord("layout-animation-start", animation),
            node,
        });
    }
    catch { }
}

export { notifyAnimationStart, notifyLayoutAnimationStart };
//# sourceMappingURL=notify-inspector.mjs.map
