/**
 * Join given regular expressions of type RegExp.
 * Each reg exp should be valid on its own. It would work anyway but invalid
 * expressions in your code might mess up highlighting in your IDE.
 *
 * @param regexps regular expressions to be joined
 * @returns one joined regular expressions of type RegExp
 */
export function joinRegExps(...regexps: RegExp[]): RegExp {
    return new RegExp(regexps.map(regexp => regexp.source).join(''), 'g');
};
