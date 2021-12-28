import { BreakIteration, ContinueIteration, AsyncIteration } from "./observer.js";

const name = (name, fn) => Object.defineProperty(fn, 'name', { value: name });
const combine = (g, f) => (...args) => g(f(...args));

const ErrorHandler = (error, item) => {
    if (error) {
        throw error;
    }
    return item;
};

export const take = (n) => name('take', combine((item) => ((--n) > 0) ? item : BreakIteration(item), ErrorHandler));
export const map = (fn) => name('map', combine((item) => fn(item), ErrorHandler));
export const filter = (fn) => name('filter', combine((item) => fn(item) ? item : ContinueIteration, ErrorHandler));
export const counter = (step = 1, value = 0) => name('counter', map(() => value += step));
export const tap = (fn) => name('tap',
    combine(
        (item) => { 
            try { fn(item) } catch (error) { Promise.reject(error) } finally { return item }
        },
        ErrorHandler
    )
);
export const reduce = (reducer, accumulator) => name('reduce',
    combine(
        (current) => ContinueIteration.store(accumulator = reducer(accumulator, current)),
        ErrorHandler
    )
);
export const async = (fn) => name('async', map(combine(AsyncIteration, fn)));
export const catchError = (fn) => name('catchError', (error, item) => error ? fn(error) : item);