import { resolveElements } from '../../utils/resolve-elements.mjs';

function createSelectorEffect(subjectEffect) {
    const effect = (subject, values) => {
        const elements = resolveElements(subject);
        const subscriptions = [];
        for (const element of elements) {
            const remove = subjectEffect(element, values);
            subscriptions.push(remove);
        }
        return () => {
            for (const remove of subscriptions)
                remove();
        };
    };
    const { test, read, get, flush, state } = subjectEffect;
    return Object.assign(effect, {
        test,
        read,
        get: get,
        flush,
        state,
    });
}

export { createSelectorEffect };
//# sourceMappingURL=create-dom-effect.mjs.map
