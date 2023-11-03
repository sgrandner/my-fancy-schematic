import { Rule, SchematicContext, Tree, apply, mergeWith, url } from '@angular-devkit/schematics';
import { MySuperFancyOptionsSchema } from './schema';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function mySuperFancySchematic(options: any): Rule {
    return (tree: Tree, context: SchematicContext) => {
        return createFile(options)(tree, context);
    };
}

function createFile(options: MySuperFancyOptionsSchema): Rule {
    return (tree: Tree, context: SchematicContext) => {

        console.log('create a file in current folder ' +
            `with arguments name: "${options.name}" ` +
            `and id: ${options.id}`);

        const templateSource = apply(
            url('./templates'),
            [],
        );

        return mergeWith(templateSource)(tree, context);
    };
}
