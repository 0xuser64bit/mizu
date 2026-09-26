/**
 * Implement a practical max duration for keyframe generation
 * to prevent infinite loops
 */
const maxGeneratorDuration = 20000;
function calcGeneratorDuration(generator, timeStep = 50, maxDuration = maxGeneratorDuration, keyframes) {
    let duration = 0;
    let state = generator.next(duration);
    keyframes?.push(state.value);
    while (!state.done && duration < maxDuration) {
        duration += timeStep;
        state = generator.next(duration);
        keyframes?.push(state.value);
    }
    return duration >= maxDuration ? Infinity : duration;
}

export { calcGeneratorDuration, maxGeneratorDuration };
//# sourceMappingURL=calc-duration.mjs.map
