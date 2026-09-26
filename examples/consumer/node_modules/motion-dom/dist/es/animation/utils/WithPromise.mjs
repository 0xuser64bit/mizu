class WithPromise {
    constructor() {
        this.isResolved = false;
    }
    get finished() {
        if (!this._finished) {
            this._finished = this.isResolved
                ? Promise.resolve()
                : new Promise((resolve) => {
                    this._resolve = resolve;
                });
        }
        return this._finished;
    }
    updateFinished() {
        this._finished = this._resolve = undefined;
        this.isResolved = false;
    }
    notifyFinished() {
        this.isResolved = true;
        this._resolve?.();
    }
    /**
     * Allows the animation to be awaited.
     *
     * @deprecated Use `finished` instead.
     */
    then(onResolve, onReject) {
        return this.finished.then(onResolve, onReject);
    }
}

export { WithPromise };
//# sourceMappingURL=WithPromise.mjs.map
