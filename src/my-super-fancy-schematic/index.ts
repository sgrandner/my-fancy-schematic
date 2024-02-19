import { Rule, SchematicContext, Tree, apply, chain, filter, mergeWith, move, renameTemplateFiles, template, url } from '@angular-devkit/schematics';
import { MySuperFancyOptionsSchema } from './schema';
import * as fs from 'fs';
import { ComponentName } from './_domain/componentName';
import { ComponentInput, ComponentInputResult } from './_domain/componentInput';

import '../utils/to-upper-camel-case';
import { arrayWithIsLast } from '../utils/array-with-is-last';
import { customConsoleLog } from '../utils/custom-console-log';
import { joinRegExps } from '../utils/compose-reg-exp';
import { ComponentOutput, ComponentOutputResult } from './_domain/componentOutput';
import { setWorkingToProjectRootDirAndReturnTargetPath } from '../utils/path-handling';

export function mySuperFancySchematic(options: MySuperFancyOptionsSchema): Rule {

    return (tree: Tree, context: SchematicContext) => {

        const targetPath = setWorkingToProjectRootDirAndReturnTargetPath(options.targetPath);

        return chain([
            createJsonFile(options, targetPath),
            createFancyComponent(options, targetPath),
        ])(tree, context);
    };
}

function createJsonFile(options: MySuperFancyOptionsSchema, targetPath: string): Rule {

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
                move(targetPath),
            ],
        );

        return mergeWith(templateSource)(tree, context);
    };
}

function createFancyComponent(options: MySuperFancyOptionsSchema, targetPath: string): Rule {

    return (tree: Tree, context: SchematicContext) => {

        const componentName = readComponentName(targetPath);
        const componentNameCamelized = componentName.name.toUpperCamelCase();

        const componentSelector = parseComponentSelector(targetPath, componentName.filename);
        customConsoleLog(`component selector: ${componentSelector}`);

        const parsedInputs = parseInputsFromComponent(targetPath, componentName.filename);
        const inputStrings = processInputResults(parsedInputs);

        const parsedOutputs = parseOutputsFromComponent(targetPath, componentName.filename);
        const outputStrings = processOutputResults(parsedOutputs);

        const templateSource = apply(
            url('./templates'),
            [
                filter((path) => path.endsWith('.fancy.ts.template')),
                // NOTE passed arguments are used as values for placeholders in files and for file names
                template({
                    ...options,
                    componentName: componentName.name,
                    componentNameCamelized,
                    componentSelector,
                    arrayWithIsLast,
                    inputStrings,
                    outputStrings,
                }),
                renameTemplateFiles(),
                move(targetPath),
            ],
        );

        return mergeWith(templateSource)(tree, context);
    };
}

function readComponentName(targetPath: string): ComponentName {

    const filenames = fs.readdirSync(targetPath);
    customConsoleLog(`read from target path ${targetPath}`);
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

function parseComponentSelector(targetPath: string, filename: string): string {
    const buffer = fs.readFileSync(`${targetPath}${filename}`, {
        encoding: "utf8",
    });
    const pattern = RegExp(/selector:\s*['|"]([a-zA-Z0-9-]+)['|"]/g);

    let parsedSelectorResult: RegExpExecArray | null;
    let parsedSelector: string | undefined = undefined;

    while ((parsedSelectorResult = pattern.exec(buffer)) !== null) {
        if (parsedSelector !== undefined) {
            throw new Error('More than one match for "selector" found !');
        }
        // NOTE store capture group
        parsedSelector = parsedSelectorResult[ 1 ];
    }

    if (parsedSelector === undefined) {
        throw new Error('No match for "selector" found !');
    }

    return parsedSelector;
}

function parseInputsFromComponent(targetPath: string, filename: string): ComponentInput[] {

    const buffer = fs.readFileSync(`${targetPath}${filename}`, { encoding: 'utf8' });

    const patternInputs = generateInputPattern();
    customConsoleLog(patternInputs.source, 'regex for component inputs:');

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
    const type = /(?::\s*([a-zA-Z0-9-_<>{}\[\]:\s\|]+[a-zA-Z0-9-_<>{}\[\]:]))?/;
    const value = /(?:\s*=\s*([a-zA-Z0-9-_<>\[\]\{\}:,'"\s\|]+))?/;
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

function processInputResults(parsedInputs: ComponentInput[]): ComponentInputResult[] {
    const inputResults: ComponentInputResult[] = [];

    for (const i of parsedInputs) {
        const stringArray: string[] = [];

        // NOTE add name of input from component
        const name = !!i.alias && i.alias.length > 0 ? i.alias : i.name ?? '';
        stringArray.push(name);

        // NOTE add input type from component
        let type: string | undefined;
        if (!!i.type && i.type.length > 0) {
            type = i.type;
        } else if (!!i.setterType && i.setterType.length > 0) {
            type = i.setterType;
        }
        if (type !== undefined && type.length > 0) {
            stringArray.push(`: ${type}`);
        }

        if (!!i.value && i.value.length > 0) {
            // NOTE add input default value from component
            stringArray.push(` = ${i.value}`);
        } else {
            // NOTE add a dummy value for storybook if no default is set in the component
            const dummyValue = generateDummyValue(type);
            stringArray.push(` = ${dummyValue}`);
        }

        inputResults.push({
            name,
            complete: stringArray.join(''),
        });
    }

    return inputResults;
}

function parseOutputsFromComponent(targetPath: string, filename: string): ComponentOutput[] {

    const buffer = fs.readFileSync(`${targetPath}${filename}`, { encoding: 'utf8' });

    const patternOutputs = generateOutputPattern();
    customConsoleLog(patternOutputs.source, 'regex for component outputs:');

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
    const type = /(?::\s*([a-zA-Z0-9-_<>{}\[\]:\s\|]+[a-zA-Z0-9-_<>{}\[\]:]))?/;
    const initializer = /(?:\s*=\s*([a-zA-Z0-9-_<>\(\)\[\]\{\}:,'"\s\|]+))?/;

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

function processOutputResults(parsedOutputs: ComponentOutput[]): ComponentOutputResult[] {
    const outputResults: ComponentOutputResult[] = [];

    for (const i of parsedOutputs) {
        const stringArray: string[] = [];

        const name = !!i.alias && i.alias.length > 0 ? i.alias : i.name ?? '';
        stringArray.push(name);

        if (!!i.type && i.type.length > 0) {
            stringArray.push(`: ${i.type}`);
        }

        if (!!i.initializer && i.initializer.length > 0) {
            stringArray.push(` = ${i.initializer}`);
        }

        stringArray.push(';');

        outputResults.push({
            name,
            complete: stringArray.join(''),
        });
    }

    return outputResults;
}

function generateDummyValue(type: string | undefined): string {
    let dummyValue: string;

    switch (type) {
        case 'string':
            dummyValue = "'fancy string'";
            break;
        case 'number':
            dummyValue = '42';
            break;
        case 'boolean':
            dummyValue = 'false';
            break;
        default:
            dummyValue = "'unknown type'";
            break;
    }

    return dummyValue;
}
