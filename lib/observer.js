const Break = Symbol('Break');
const Continue = Symbol('Continue');

class IterationControl {
    constructor(symbol, value = undefined) {
        this.symbol = symbol;
        this.value = value;
    }
}

export const BreakIteration = (value) => new IterationControl(Break, value);
export const ContinueIteration = Object.seal(new IterationControl(Continue));

function *reduce(iterator, value) {
    for (const fn of iterator) {
        if ((value = fn(value)) instanceof IterationControl) {
            break;
        }
    }
    return value;
}

export async function *pipe(generator, ...fn) {
    for await (const item of generator) {
        const result = yield* reduce(fn, item);
        if (result instanceof IterationControl) {
            if (result.symbol === Continue) {
                continue;
            } else {
                yield result.value;
                break;
            }
        } else {
            yield result;
        }
    }
}
