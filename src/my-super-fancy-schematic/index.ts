import { Rule, SchematicContext, Tree, apply, chain, filter, mergeWith, template, url } from '@angular-devkit/schematics';
import { MySuperFancyOptionsSchema } from './schema';
import * as fs from 'fs';
import { camelize } from '@angular-devkit/core/src/utils/strings';

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

        const componentName = readComponentName();
        const componentNameCamelized = componentName.toUpperCamelCase();

        console.log('create a fancy component file in current folder ' +
            `for component name: "${componentNameCamelized}"`);

        const templateSource = apply(
            url('./templates'),
            [
                filter((path) => path.endsWith('.fancy.js')),
                template({
                    ...options,
                    componentName,
                    componentNameCamelized,
                }),
            ],
        );

        return mergeWith(templateSource)(tree, context);
    };
}

function readComponentName(): string {

    // const asdf = tree.read('/package.json');
    // const asdf = tree.getDir('/');
    // console.log(JSON.stringify(asdf));

    const filenames = fs.readdirSync('./');
    console.log(`reading file names in directory: ${filenames.toString()}`);

    const pattern = /([a-zA-Z0-9-_.]+)\.component\.js/;
    const componentFilename = filenames.find((filename) => pattern.test(filename));
    const componentName = componentFilename?.replace(pattern, '$1');
    // TODO try to solve these two steps with one reduce step ?!

    console.log(`componentFilename: ${componentFilename}`);
    console.log(`componentName: ${componentName}`);

    if (!componentName) {
        throw new Error('No component name can be matched !');
    }

    return componentName;
}
