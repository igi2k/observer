const NOOP = () => {};

const asyncGenerator = (init, teardown) => {
    let cleanup = NOOP;
    let next = NOOP;
    async function *emitter(init, teardown) {
        const [infinite, context] = init((value) => next(value));
        const cleanResources = teardown.bind(null, context);
        try {
            do {
                const value = await new Promise((resolve, reject) => {
                    next = resolve;
                    cleanup = reject;
                });
                next = NOOP;
                cleanup = cleanResources;
                yield value;
            } while (infinite);
        } catch {
            cleanResources()
        }
    }
    const { return: cancel } = emitter.prototype;
    return Object.assign(emitter(init, teardown), { return() { 
        try {
            cleanup();
        } finally {
            return (this.return = cancel).apply(this, arguments);
        }
     }});
};

/**
 * Timeout Generator
 * @param {number} ms 
 * @param {any} [value]
 */
export const timeout = (ms, value = undefined) => {
    return asyncGenerator(
        (callback) => [false, setTimeout((value) => callback(value), ms, value)],
        (handle) => clearTimeout(handle)
    )
}

/**
 * Interval Generator
 * @param {number} ms 
 * @param {any} [value]
 */
 export const interval = (ms, value = undefined) => {
    return asyncGenerator(
        (callback) => [true, setInterval((value) => callback(value), ms, value)],
        (handle) => clearInterval(handle)
    )
}

/**
 * Event Generator
 * @param {EventTarget} target
 * @param {string} eventName
 */
 export const fromEvent = (target, eventName) => {
    return asyncGenerator(
        (callback) => {
            const handler = (event) => callback(event);
            target.addEventListener(eventName, handler);
            return [true, handler];
        },
        (handler) => target.removeEventListener(eventName, handler)
    )
}
