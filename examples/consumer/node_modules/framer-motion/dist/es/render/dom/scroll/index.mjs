import { noop } from 'motion-utils';
import { attachToAnimation } from './attach-animation.mjs';
import { scrollInfo } from './track.mjs';

function scroll(onScroll, { axis = "y", source, container = document.scrollingElement, ...options } = {}) {
    if (!container)
        return noop;
    const optionsWithDefaults = {
        axis,
        container: source || container,
        ...options,
    };
    return typeof onScroll === "function"
        ? scrollInfo((info) => onScroll(info[axis].progress, info), optionsWithDefaults)
        : attachToAnimation(onScroll, optionsWithDefaults);
}

export { scroll };
//# sourceMappingURL=index.mjs.map
