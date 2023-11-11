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

        // TODO parse component file and return object containing input and output names, types and default values
        const parsedInputs = parseInputsFromComponent(component.filename);

        const i = parsedInputs[ 9 ];

        let input1 = i.name;
        if (i.type?.length > 0) {
            input1 = input1.concat(`: ${i.type}`);
        }
        if (i.value?.length > 0) {
            input1 = input1.concat(` = ${i.value}`);
        }
        input1 = input1.concat(';');

        const templateSource = apply(
            url('./templates'),
            [
                filter((path) => path.endsWith('.fancy.ts')),
                // passed arguments are used as values for placeholders in files and for file names
                template({
                    ...options,
                    componentName: component.name,
                    componentNameCamelized,
                    input1,
                }),
            ],
        );

        return mergeWith(templateSource)(tree, context);
    };
}

function readComponentName(): ComponentName {

    // const asdf = tree.read('/package.json');
    // const asdf = tree.getDir('/');
    // console.log(JSON.stringify(asdf));

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

    // const patternUntypedInputs = /@Input\(\)\s+([a-zA-Z0-9-_$]+)(?:\?|!)?(?![a-zA-Z0-9-_$?!:=\s]);?/g;
    // for (const match of buffer.matchAll(patternUntypedInputs)) {
    //     console.log(`_${match[ 1 ]}_`);
    // }

    // const patternTypedInputs = /@Input\(\)\s+([a-zA-Z0-9-_$]+)(?:\?|!)?:\s+([a-zA-Z<>\s{}\[\]:]+)(?![a-zA-Z0-9-_$?!:=\s]);?/g;
    // for (const match of buffer.matchAll(patternTypedInputs)) {
    //     console.log(`_${match[ 1 ]}_${match[ 2 ]}_`);
    // }

    // const patternUntypedInputsWithDefault = /@Input\(\)\s+([a-zA-Z0-9-_$]+)(?:\?|!)?\s+=\s+([a-zA-Z0-9<>'"]+)(?![a-zA-Z0-9-_$?!:=\s]);?/g;
    // for (const match of buffer.matchAll(patternUntypedInputsWithDefault)) {
    //     console.log(`_${match[ 1 ]}_${match[ 2 ]}_`);
    // }

    // const patternTypedInputsWithDefault = /@Input\(\)\s+([a-zA-Z0-9-_$]+)(?:\?|!)?:\s+([a-zA-Z<>\s{}\[\]:]+)\s+=\s+([a-zA-Z0-9<>'"]+)(?![a-zA-Z0-9-_$?!:=\s]);?/g;
    // for (const match of buffer.matchAll(patternTypedInputsWithDefault)) {
    //     console.log(`_${match[ 1 ]}_${match[ 2 ]}_${match[ 3 ]}_`);
    // }

    const parsedInputs: ComponentInput[] = [];

    const patternInputs = /@Input\(\)\s+([a-zA-Z0-9-_$]+)(?:\?|!)?(?::\s+([a-zA-Z<>\s{}\[\]:]+))?(?:\s+=\s+([a-zA-Z0-9<>'"]+))?(?![a-zA-Z0-9-_$?!:=\s]);?/g;

    for (const match of buffer.matchAll(patternInputs)) {

        console.log(`_${match[ 1 ]}_${match[ 2 ]}_${match[ 3 ]}_`);

        parsedInputs.push({
            name: match[ 1 ],
            type: match[ 2 ],
            value: match[ 3 ],
        });
    }

    return parsedInputs;
}
