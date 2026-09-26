import { progress, velocityPerSecond } from 'motion-utils';

/**
 * A time in milliseconds, beyond which we consider the scroll velocity to be 0.
 */
const maxElapsed = 50;
const createAxisInfo = () => ({
    current: 0,
    offset: [],
    progress: 0,
    scrollLength: 0,
    targetOffset: 0,
    targetLength: 0,
    containerLength: 0,
    velocity: 0,
});
const createScrollInfo = () => ({
    time: 0,
    x: createAxisInfo(),
    y: createAxisInfo(),
});
/**
 * Also iterated with for...in as the list of axes.
 */
const axisKeys = {
    x: {
        length: "Width",
        position: "Left",
    },
    y: {
        length: "Height",
        position: "Top",
    },
};
function updateAxisInfo(element, axisName, info, time) {
    const axis = info[axisName];
    const { length, position } = axisKeys[axisName];
    const prev = axis.current;
    const prevTime = info.time;
    axis.current = Math.abs(element[`scroll${position}`]);
    axis.containerLength = element[`client${length}`];
    axis.targetLength = element[`scroll${length}`];
    axis.scrollLength = axis.targetLength - axis.containerLength;
    axis.offset.length = 0;
    axis.offset[0] = 0;
    axis.offset[1] = axis.scrollLength;
    axis.progress = progress(0, axis.scrollLength, axis.current);
    const elapsed = time - prevTime;
    axis.velocity =
        elapsed > maxElapsed
            ? 0
            : velocityPerSecond(axis.current - prev, elapsed);
}
/**
 * Measures a scroll container. Runs once per container per frame; every
 * handler on that container derives its info from the result.
 */
function updateScrollInfo(element, info, time) {
    for (const axis in axisKeys) {
        updateAxisInfo(element, axis, info, time);
    }
    info.time = time;
}

export { axisKeys, createScrollInfo, updateScrollInfo };
//# sourceMappingURL=info.mjs.map
