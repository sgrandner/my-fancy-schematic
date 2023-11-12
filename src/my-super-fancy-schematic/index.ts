import { Rule, SchematicContext, Tree, apply, chain, filter, mergeWith, template, url } from '@angular-devkit/schematics';
import { MySuperFancyOptionsSchema } from './schema';
import * as fs from 'fs';
import { camelize } from '@angular-devkit/core/src/utils/strings';
import { ComponentName } from './_domain/componentName';
import { ComponentInput } from './_domain/componentInput';

// TODO move to declaration file in @types folder
declare global {
    interface String {
        toUpperCamelCase(): string;
    }
}

String.prototype.toUpperCamelCase = function (): string {
    const value = camelize(this.valueOf());
    return value.substring(0, 1).toUpperCase() + value.substring(1);
}

const FILE_PATH = './';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function mySuperFancySchematic(options: any): Rule {

    return (tree: Tree, context: SchematicContext) => {
        return chain([
            createJsonFile(options),
            createFancyComponent(options),
        ])(tree, context);
    };
}

function createJsonFile(options: MySuperFancyOptionsSchema): Rule {

    return (tree: Tree, context: SchematicContext) => {

        console.log('create a json file in current folder ' +
            `with arguments name: "${options.name}" ` +
            `and id: ${options.id}`);

        const templateSource = apply(
            url('./templates'),
            [
                filter((path) => path.endsWith('.json')),
                template({ ...options }),
            ],
        );

        return mergeWith(templateSource)(tree, context);
    };
}

function createFancyComponent(options: MySuperFancyOptionsSchema): Rule {

    return (tree: Tree, context: SchematicContext) => {

        const component = readComponentName();
        const componentNameCamelized = component.name.toUpperCamelCase();

        console.log('create a fancy component file in current folder ' +
            `for component name: "${componentNameCamelized}"`);

        const parsedInputs = parseInputsFromComponent(component.filename);
        const inputStrings = generateInputStrings(parsedInputs);

        const templateSource = apply(
            url('./templates'),
            [
                filter((path) => path.endsWith('.fancy.ts')),
                // NOTE passed arguments are used as values for placeholders in files and for file names
                template({
                    ...options,
                    componentName: component.name,
                    componentNameCamelized,
                    arrayWithIsLast,
                    inputStrings,
                }),
            ],
        );

        return mergeWith(templateSource)(tree, context);
    };
}

function readComponentName(): ComponentName {

    const filenames = fs.readdirSync(FILE_PATH);
    console.log(`reading file names in directory: ${filenames.toString()}`);

    const pattern = /([a-zA-Z0-9-_.]+)\.component\.ts/;
    const filename = filenames.find((filename) => pattern.test(filename));
    const name = filename?.replace(pattern, '$1');
    // TODO try to solve these two steps with one reduce step ?!

    console.log(`componentFilename: ${filename}`);
    console.log(`componentName: ${name}`);

    if (!filename || !name) {
        throw new Error('No component name can be matched !');
    }

    return {
        filename,
        name,
    };
}

function parseInputsFromComponent(filename: string): ComponentInput[] {

    const buffer = fs.readFileSync(`${FILE_PATH}${filename}`, { encoding: 'utf8' });

    const patternInputs = /@Input\((?:'|")?([a-zA-Z0-9-_]*)(?:'|")?\)(?: set)?\s*\n?\s*([a-zA-Z0-9-_$]+)(?:\?|!)?(?::\s+([a-zA-Z0-9-_<>\s{}\[\]:]+))?(?:\s+=\s+([a-zA-Z0-9-_<>'"]+))?(?![a-zA-Z0-9-_$?!:=\s]);?(?:\((?:[a-zA-Z0-9-_$]+)(?:\?|!)?(?::\s+([a-zA-Z0-9-_<>\s{}\[\]:]+))\)\s*\{)?/g;

    const parsedInputs: ComponentInput[] = [];
    for (const match of buffer.matchAll(patternInputs)) {

        console.log(`_${match[ 1 ]}_${match[ 2 ]}_${match[ 3 ]}_${match[ 4 ]}_${match[ 5 ]}_`);

        parsedInputs.push({
            alias: match[ 1 ],
            name: match[ 2 ],
            type: match[ 3 ],
            value: match[ 4 ],
            setterType: match[ 5 ],
        });
    }

    return parsedInputs;
}

function generateInputStrings(parsedInputs: ComponentInput[]): string[] {

    const inputStrings: string[] = [];

    for (const i of parsedInputs) {

        let inputString = i.alias?.length > 0 ? i.alias : i.name;

        if (i.type?.length > 0) {
            inputString = inputString.concat(`: ${i.type}`);
        } else if (i.setterType?.length > 0) {
            inputString = inputString.concat(`: ${i.setterType}`);
        }

        if (i.value?.length > 0) {
            inputString = inputString.concat(` = ${i.value}`);
        }

        inputString = inputString.concat(';');

        inputStrings.push(inputString);
    }

    return inputStrings;
}

// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators
//     https://stackoverflow.com/questions/54116774/detect-last-iteration-in-for-of-loop-in-es6-javascript
//
// usage example:
//    for (const j of arrayWithIsLast([ 'asdf', 'qwer', 'yxcv' ])) {
//        const delimiter = j.isLast ? '!' : ',';
//        console.log(`${j.value}${delimiter}`);
//    }
export function* arrayWithIsLast(iterable: string[] | number[]) {

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
