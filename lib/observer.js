const Async = Symbol('Async');
const Break = Symbol('Break');
const Continue = Symbol('Continue');

class IterationControl {
    constructor(symbol, value) {
        this.symbol = symbol;
        this.value = value;
        this.hasValue = arguments.length > 1;
    }
}

class IterationContext {
    constructor(control, operators) {
        this.control = control;
        this.operators = operators;
    }
    get process() {
        return this.control.hasValue;
    }
}

export const AsyncIteration = (value) => Object.freeze(new IterationControl(Async, value));
export const BreakIteration = (value) => Object.freeze(new IterationControl(Break, value));
export const ContinueIteration = Object.freeze(Object.assign(new IterationControl(Continue), { 
    store(value) { return Object.freeze(new IterationControl(this.symbol, value)) }
}));

async function apply(operators, result, unhandledError = undefined) {
    const iterator = operators[Symbol.iterator]();
    for (const operator of iterator) {
        try {
            if ((result = operator(unhandledError, result)) instanceof IterationControl) {
                if (result.symbol === Async) {
                    result = await result.value;
                } else {
                    return [new IterationContext(result, iterator)];
                }
            }
            unhandledError = undefined;
        } catch (error) {
            result = undefined;
            unhandledError = error;
        }
    }
    if (unhandledError) {
        throw unhandledError;
    }
    return [,result];
}

export async function *pipe(generator, ...operators) {
    let context;
    for await (const current of generator) {
        const [iterationContext, result] = await apply(operators, current);
        if (context = iterationContext) {
            if (context.control.symbol === Continue) {
                continue;
            } else {
                break;
            }
        } else {
            yield result;
        }
    }
    while (context?.process) {
        const [iterationContext, result] = await apply(context.operators, context.control.value);
        if (!(context = iterationContext)) {
            return yield result;
        }
    }
}
