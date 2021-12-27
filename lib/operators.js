import { BreakIteration, ContinueIteration } from "./observer.js";

export const take = (n) => (item) => ((--n) > 0) ? item : BreakIteration(item);
export const map = (fn) => (item) => fn(item);
export const filter = (fn) => (item) => fn(item) ? item : ContinueIteration;
export const counter = (step = 1, value = 0) => map(() => value += step);
export const tap = (fn) => (item) => {
    try { fn(item) } catch (error) { Promise.reject(error) } finally { return item }
};