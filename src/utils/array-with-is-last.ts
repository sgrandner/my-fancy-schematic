export type ArrayWithIsLastGenerator = Generator<{
    value: string | number,
    isLast: boolean | undefined,
}>;

/**
 * Generator function returning a generator (special type of iterator)
 * for the given string or number array with entries containing
 * the value and the information whether it is the last entry.
 *
 * see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators
 *     https://stackoverflow.com/questions/54116774/detect-last-iteration-in-for-of-loop-in-es6-javascript
 *
 * usage example:
 *    for (const j of arrayWithIsLast([ 'asdf', 'qwer', 'yxcv' ])) {
 *        const delimiter = j.isLast ? '!' : ',';
 *        console.log(`${j.value}${delimiter}`);
 *    }
 * @param iterable string or number array
 */
export function* arrayWithIsLast(iterable: string[] | number[]): ArrayWithIsLastGenerator {

    const iterator = iterable[ Symbol.iterator ]();
    let current = iterator.next();
    let next = iterator.next();

    while (!current.done) {
        yield {
            value: current.value,
            isLast: next.done,
        };
        current = next;
        next = iterator.next();
    }
}
