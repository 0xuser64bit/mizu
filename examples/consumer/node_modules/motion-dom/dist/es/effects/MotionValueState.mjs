import { frame } from '../frameloop/frame.mjs';

class MotionValueState {
    /**
     * @param step - The frameloop step renders are scheduled in. Defaults
     * to `frame.render`. Effects that feed a render loop running in
     * `frame.render` (GPU scenes) should write in `frame.preRender`.
     */
    constructor(step = frame.render) {
        this.step = step;
        this.values = new Map();
        /**
         * Renders scheduled for the next flush, usually one or two (values
         * bound to the same computed render, e.g. `x` and `y` to `transform`,
         * share an entry). Tracked with a count rather than truncating the
         * array so no backing store is reallocated every frame. Kept per
         * state so pending writes can be flushed synchronously before the
         * subject is measured.
         */
        this.pending = [];
        this.numPending = 0;
        /**
         * Run the pending renders. Resetting the count first means a render
         * scheduled while flushing lands in the next frame, as with the
         * frameloop itself.
         */
        this.flush = () => {
            const { pending, numPending } = this;
            this.numPending = 0;
            for (let i = 0; i < numPending; i++)
                pending[i]();
        };
    }
    /**
     * @param render - Writes the value to the subject. Renders read the
     * motion value directly rather than a cached copy, so there is one
     * place a value lives.
     * @param computed - A value already in this state (e.g. `transform`)
     * whose render should run whenever `value` changes.
     */
    set(name, value, render, computed) {
        this.values.get(name)?.onRemove();
        if (computed) {
            for (const entry of this.values.values()) {
                if (entry.value === computed)
                    render = entry.render;
            }
        }
        const onChange = () => render && this.schedule(render);
        /**
         * Values created ahead of a DOM read start out undefined and
         * have nothing to render until they're set.
         */
        value.get() !== undefined && onChange();
        const cancelOnChange = value.on("change", onChange);
        const onRemove = () => {
            cancelOnChange();
            render && !computed && this.cancel(render);
            this.values.delete(name);
        };
        this.values.set(name, {
            value,
            render: computed ? undefined : render,
            onRemove,
        });
        return onRemove;
    }
    get(name) {
        return this.values.get(name)?.value;
    }
    /**
     * Detach every value from this state and return them, so another
     * renderer can take them over. The state stays cached by its effect,
     * so the bound transforms are reset too rather than leaking into
     * values bound later.
     */
    release() {
        const values = new Map();
        this.values.forEach((entry, name) => {
            values.set(name, entry.value);
            entry.onRemove();
        });
        this.transformKeys = this.transformValues = undefined;
        return values;
    }
    schedule(render) {
        const { pending, numPending } = this;
        for (let i = 0; i < numPending; i++) {
            if (pending[i] === render)
                return;
        }
        numPending || this.step(this.flush);
        pending[this.numPending++] = render;
    }
    cancel(render) {
        const { pending } = this;
        for (let i = 0; i < this.numPending; i++) {
            if (pending[i] === render) {
                pending[i] = pending[--this.numPending];
                return;
            }
        }
    }
}

export { MotionValueState };
//# sourceMappingURL=MotionValueState.mjs.map
