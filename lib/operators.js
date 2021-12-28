import { BreakIteration, ContinueIteration, AsyncIteration } from "./observer.js";

const combine = (g, f) => (x) => g(f(x));

export const take = (n) => (item) => ((--n) > 0) ? item : BreakIteration(item);
export const map = (fn) => (item) => fn(item);
export const filter = (fn) => (item) => fn(item) ? item : ContinueIteration;
export const counter = (step = 1, value = 0) => map(() => value += step);
export const tap = (fn) => (item) => {
    try { fn(item) } catch (error) { Promise.reject(error) } finally { return item }
};
export const reduce = (reducer, accumulator) => (current) => ContinueIteration.store(accumulator = reducer(accumulator, current));
export const async = (fn) => map(combine(AsyncIteration, fn));