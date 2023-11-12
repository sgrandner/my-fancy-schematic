import { Rule, SchematicContext, Tree, apply, chain, filter, mergeWith, renameTemplateFiles, template, url } from '@angular-devkit/schematics';
import { MySuperFancyOptionsSchema } from './schema';
import * as fs from 'fs';
import { ComponentName } from './_domain/componentName';
import { ComponentInput } from './_domain/componentInput';

import '../utils/to-upper-camel-case';
import { arrayWithIsLast } from '../utils/array-with-is-last';
import { customConsoleLog } from '../utils/custom-console-log';

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

        customConsoleLog('create a json file in current folder ' +
            `with arguments name: "${options.name}" ` +
            `and id: ${options.id}`);

        const templateSource = apply(
            url('./templates'),
            [
                filter((path) => path.endsWith('.json.template')),
                template({ ...options }),
                renameTemplateFiles(),
            ],
        );

        return mergeWith(templateSource)(tree, context);
    };
}

function createFancyComponent(options: MySuperFancyOptionsSchema): Rule {

    return (tree: Tree, context: SchematicContext) => {

        const component = readComponentName();
        const componentNameCamelized = component.name.toUpperCamelCase();

        customConsoleLog('create a fancy component file in current folder ' +
            `for component name: "${componentNameCamelized}"`);

        const parsedInputs = parseInputsFromComponent(component.filename);
        const inputStrings = generateInputStrings(parsedInputs);

        const templateSource = apply(
            url('./templates'),
            [
                filter((path) => path.endsWith('.fancy.ts.template')),
                // NOTE passed arguments are used as values for placeholders in files and for file names
                template({
                    ...options,
                    componentName: component.name,
                    componentNameCamelized,
                    arrayWithIsLast,
                    inputStrings,
                }),
                renameTemplateFiles(),
            ],
        );

        return mergeWith(templateSource)(tree, context);
    };
}

function readComponentName(): ComponentName {

    const filenames = fs.readdirSync(FILE_PATH);
    customConsoleLog(`reading file names in directory: ${filenames.toString()}`);

    const pattern = /([a-zA-Z0-9-_.]+)\.component\.ts/;
    const filename = filenames.find((filename) => pattern.test(filename));
    const name = filename?.replace(pattern, '$1');
    // TODO try to solve these two steps with one reduce step ?!

    customConsoleLog(`componentFilename: ${filename}`);
    customConsoleLog(`componentName: ${name}`);

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

    const patternInputs = /@Input\((?:(?:'|")([a-zA-Z0-9-_]+)(?:'|"))?\)(?: set)?\s*\n?\s*([a-zA-Z0-9-_$]+)(?:\?|!)?(?::\s+([a-zA-Z0-9-_<>\s{}\[\]:]+))?(?:\s+=\s+([a-zA-Z0-9-_<>'"]+))?(?![a-zA-Z0-9-_$?!:=\s]);?(?:\((?:[a-zA-Z0-9-_$]+)(?:\?|!)?(?::\s+([a-zA-Z0-9-_<>\s{}\[\]:]+))\)\s*\{)?/g;

    const parsedInputs: ComponentInput[] = [];
    const logArray: string[] = [];
    for (const match of buffer.matchAll(patternInputs)) {

        parsedInputs.push({
            alias: match[ 1 ],
            name: match[ 2 ],
            type: match[ 3 ],
            value: match[ 4 ],
            setterType: match[ 5 ],
        });

        logArray.push(`alias: ${match[ 1 ]}, name: ${match[ 2 ]}, type: ${match[ 3 ]}, value: ${match[ 4 ]}, setterType: ${match[ 5 ]}`);
    }

    customConsoleLog(logArray, 'matched component inputs:');

    return parsedInputs;
}

function generateInputStrings(parsedInputs: ComponentInput[]): string[] {

    const inputStrings: string[] = [];

    for (const i of parsedInputs) {

        let inputString = !!i.alias && i.alias.length > 0 ? i.alias : i.name ?? '';

        if (!!i.type && i.type.length > 0) {
            inputString = inputString.concat(`: ${i.type}`);
        } else if (!!i.setterType && i.setterType.length > 0) {
            inputString = inputString.concat(`: ${i.setterType}`);
        }

        if (!!i.value && i.value.length > 0) {
            inputString = inputString.concat(` = ${i.value}`);
        }

        inputString = inputString.concat(';');

        inputStrings.push(inputString);
    }

    return inputStrings;
}
