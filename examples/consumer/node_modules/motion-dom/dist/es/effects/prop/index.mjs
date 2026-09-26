import { isObject } from 'motion-utils';
import { createEffect } from '../utils/create-effect.mjs';

/**
 * Writes motion values to the properties of any object. This is
 * animate()'s fallback for subjects no registered effect claims.
 */
const propEffect = /*@__PURE__*/ createEffect((subject, state, key, value) => {
    return state.set(key, value, () => {
        subject[key] = value.get();
    });
}, {
    test: (subject) => isObject(subject),
    read: (subject, key) => {
        const value = subject[key];
        return typeof value === "string" || typeof value === "number"
            ? value
            : undefined;
    },
});

export { propEffect };
//# sourceMappingURL=index.mjs.map
