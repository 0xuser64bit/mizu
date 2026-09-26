import { velocityPerSecond } from 'motion-utils';

const velocitySampleDuration = 5; // ms
function getGeneratorVelocity(resolveValue, t, current) {
    const prevT = Math.max(t - velocitySampleDuration, 0);
    return velocityPerSecond(current - resolveValue(prevT), t - prevT);
}
/**
 * A generator's velocity at time t in units/second: analytical where the
 * generator provides it (springs), otherwise by finite difference. Before
 * the animation has started this is its initial velocity.
 */
function calcGeneratorVelocity(generator, t, initialVelocity = 0) {
    if (t <= 0)
        return initialVelocity;
    return generator.velocity
        ? generator.velocity(t)
        : getGeneratorVelocity((s) => generator.next(s).value, t, generator.next(t).value);
}

export { calcGeneratorVelocity, getGeneratorVelocity };
//# sourceMappingURL=velocity.mjs.map
