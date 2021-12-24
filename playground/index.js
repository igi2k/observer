import { interval } from "../lib/async-generators.js";
import { pipe } from "../lib/observer.js";
import { counter, take } from "../lib/operators.js";

const arrayEqual = (a, b) => (a.length === b.length) && a.every((item, index) => item === b[index]);
const assert = (condition, message) => console.assert(condition, `\u001b[31m${message}\u001b[0m`);

function *range(a, b, step = 1) {
    for (let value = a; value <= b; value += step) {
        yield value;
    }
}



// const result = map(filter(range(1, 4), (num) => num > 2), (num) => `*${num}`);
// assert(arrayEqual(['*3', '*4'], [...result]), 'equal array');

const g = interval(100);
// setTimeout(() => g.return(), 1000);
for await (const x of pipe(g, counter(), take(2))) {
    console.log(x);
}
console.log("END")
