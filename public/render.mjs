class RenderLoop {
    /**
     * @param {Function} callback
     * @param {number} fps
     */
    constructor(callback, fps) {
        this.callback = callback;
        this.fps = fps;
        this.isActive = false;
        this.msPreviousFrame = 0;
        this.renderFunction = this.renderFunction.bind(this);
    }

    /**
     *
     * @param {DOMHighResTimeStamp} timestamp
     */
    renderFunction(timestamp) {
        if (this.msPreviousFrame === null) {
            this.msPreviousFrame = timestamp;
            window.requestAnimationFrame(this.renderFunction);
            return;
        }

        const deltaTime = timestamp - this.msPreviousFrame;
        this.msPreviousFrame = timestamp;

        this.callback(deltaTime / 1000);

        if (this.isActive) window.requestAnimationFrame(this.renderFunction.bind(this));
    }

    start() {
        this.isActive = true;
        this.msPreviousFrame = null;
        window.requestAnimationFrame(this.renderFunction);
        return this;
    }

    stop() {
        this.isActive = false;
    }
}

export { RenderLoop };
