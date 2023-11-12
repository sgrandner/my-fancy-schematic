import { Rule, SchematicContext, Tree, apply, chain, filter, mergeWith, renameTemplateFiles, template, url } from '@angular-devkit/schematics';
import { MySuperFancyOptionsSchema } from './schema';
import * as fs from 'fs';
import { ComponentName } from './_domain/componentName';
import { ComponentInput } from './_domain/componentInput';

import '../utils/to-upper-camel-case';
import { arrayWithIsLast } from '../utils/array-with-is-last';
import { customConsoleLog } from '../utils/custom-console-log';
import { joinRegExps } from '../utils/compose-reg-exp';
import { ComponentOutput } from './_domain/componentOutput';

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

        const parsedOutputs = parseOutputsFromComponent(component.filename);
        const outputStrings = generateOutputStrings(parsedOutputs);

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
                    outputStrings,
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

    const patternInputs = generateInputPattern();
    customConsoleLog(patternInputs.source);

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

function generateInputPattern(): RegExp {

    const alias = /(?:(?:'|")([a-zA-Z0-9-_]+)(?:'|"))?/;
    const spacesAndBreaks = /\s*\n?\s*/;        // should work without \n since \s also contains line breaks ?!
    const name = /([a-zA-Z0-9-_$]+)(?:\?|!)?/;
    // TODO Is there another way to match a group containing spaces which do not end with a space ?
    //      A lookahead did not really work since it does not matter what is after this group
    //      but how does this group end !?
    const type = /(?::\s*([a-zA-Z0-9-_<>\s{}\[\]:]+[a-zA-Z0-9-_<>{}\[\]:]))?/;
    const value = /(?:\s*=\s*([a-zA-Z0-9-_<>\[\]\{\}\s:,'"]+))?/;
    const setterArgumentWithType = /(?:\((?:[a-zA-Z0-9-_$]+)(?:\?|!)?(?::\s*([a-zA-Z0-9-_<>\s{}\[\]:]+))?\)\s*\{)?/;

    return joinRegExps(
        /@Input\(/,
        alias,
        /\)/,
        /(?: set)?/,
        spacesAndBreaks,
        name,
        type,
        value,
        /;?/,
        setterArgumentWithType,
    );
}

function generateInputStrings(parsedInputs: ComponentInput[]): string[] {

    const inputStrings: string[] = [];

    for (const i of parsedInputs) {

        const stringArray: string[] = [];
        stringArray.push(!!i.alias && i.alias.length > 0 ? i.alias : i.name ?? '')

        if (!!i.type && i.type.length > 0) {
            stringArray.push(`: ${i.type}`);
        } else if (!!i.setterType && i.setterType.length > 0) {
            stringArray.push(`: ${i.setterType}`);
        }

        if (!!i.value && i.value.length > 0) {
            stringArray.push(` = ${i.value}`);
        }

        stringArray.push(';');

        inputStrings.push(stringArray.join(''));
    }

    return inputStrings;
}

function parseOutputsFromComponent(filename: string): ComponentOutput[] {

    const buffer = fs.readFileSync(`${FILE_PATH}${filename}`, { encoding: 'utf8' });

    const patternOutputs = generateOutputPattern();
    customConsoleLog(patternOutputs.source);

    const parsedOutputs: ComponentOutput[] = [];
    const logArray: string[] = [];
    for (const match of buffer.matchAll(patternOutputs)) {

        parsedOutputs.push({
            alias: match[ 1 ],
            name: match[ 2 ],
            type: match[ 3 ],
            initializer: match[ 4 ],
        });

        logArray.push(`alias: ${match[ 1 ]}, name: ${match[ 2 ]}, type: ${match[ 3 ]}, initializer: ${match[ 4 ]}`);
    }

    customConsoleLog(logArray, 'matched component outputs:');

    return parsedOutputs;
}

function generateOutputPattern(): RegExp {

    const alias = /(?:(?:'|")([a-zA-Z0-9-_]+)(?:'|"))?/;
    const spacesAndBreaks = /\s*\n?\s*/;        // should work without \n since \s also contains line breaks ?!
    const name = /([a-zA-Z0-9-_$]+)(?:\?|!)?/;
    // TODO same as for input type !
    const type = /(?::\s*([a-zA-Z0-9-_<>\s{}\[\]:]+[a-zA-Z0-9-_<>{}\[\]:]))?/;
    const initializer = /(?:\s*=\s*([a-zA-Z0-9-_<>\(\)\[\]\{\}\s:,'"]+))?/;

    return joinRegExps(
        /@Output\(/,
        alias,
        /\)/,
        spacesAndBreaks,
        name,
        type,
        initializer,
        /;?/,
    );
}

function generateOutputStrings(parsedOutputs: ComponentOutput[]): string[] {

    const outputStrings: string[] = [];

    for (const i of parsedOutputs) {

        const stringArray: string[] = [];
        stringArray.push(!!i.alias && i.alias.length > 0 ? i.alias : i.name ?? '')

        if (!!i.type && i.type.length > 0) {
            stringArray.push(`: ${i.type}`);
        }

        if (!!i.initializer && i.initializer.length > 0) {
            stringArray.push(` = ${i.initializer}`);
        }

        stringArray.push(';');

        outputStrings.push(stringArray.join(''));
    }

    return outputStrings;
}
