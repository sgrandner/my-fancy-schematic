import { Rule, SchematicContext, Tree, apply, mergeWith, url } from '@angular-devkit/schematics';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function mySuperFancySchematic(options: any): Rule {
    return (tree: Tree, context: SchematicContext) => {
        return createFile(options)(tree, context);
    };
}

function createFile(_options: any): Rule {
    return (tree: Tree, context: SchematicContext) => {

        console.log('create a file in current folder');

        const templateSource = apply(
            url('./templates'),
            [],
        );

        return mergeWith(templateSource)(tree, context);
    };
}
