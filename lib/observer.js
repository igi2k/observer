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

export const BreakIteration = (value) => Object.freeze(new IterationControl(Break, value));
export const ContinueIteration = Object.freeze(Object.assign(new IterationControl(Continue), { 
    store(value) { return Object.freeze(new IterationControl(this.symbol, value)) }
}));

function apply(operators, value) {
    const iterator = operators[Symbol.iterator]();
    for (const operator of iterator) {
        if ((value = operator(value)) instanceof IterationControl) {
            return new IterationContext(value, iterator);
        }
    }
    return value;
}

export async function *pipe(generator, ...operators) {
    let context;
    for await (const current of generator) {
        const result = apply(operators, current);
        if (result instanceof IterationContext) {
            context = result;
            if (result.control.symbol === Continue) {
                continue;
            } else {
                break;
            }
        } else {
            yield result;
        }
    }
    while (context?.process) {
        const result = apply(context.operators, context.control.value);
        if (result instanceof IterationContext) {
            context = result;
        } else {
            return yield result;
        }
    }
}
