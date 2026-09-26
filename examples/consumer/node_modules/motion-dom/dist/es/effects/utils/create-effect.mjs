import { MotionValueState } from '../MotionValueState.mjs';

function createEffect(addValue, { step, ...options } = {}) {
    const stateCache = new WeakMap();
    const effect = (subject, values) => {
        const state = stateCache.get(subject) ?? new MotionValueState(step);
        stateCache.set(subject, state);
        const subscriptions = [];
        for (const key in values) {
            const value = values[key];
            const remove = addValue(subject, state, key, value);
            subscriptions.push(remove);
        }
        return () => {
            for (const cancel of subscriptions)
                cancel();
        };
    };
    return Object.assign(effect, options, {
        get: (subject, key) => stateCache.get(subject)?.get(key),
        flush: (subject) => stateCache.get(subject)?.flush(),
        state: (subject) => stateCache.get(subject),
    });
}

export { createEffect };
//# sourceMappingURL=create-effect.mjs.map
