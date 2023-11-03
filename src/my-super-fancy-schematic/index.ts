import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function mySuperFancySchematic(options: any): Rule {
    return (tree: Tree, context: SchematicContext) => {
        return addFile(options)(tree, context);
    };
}

function addFile(_options: any): Rule {
    return (_tree: Tree, context: SchematicContext) => {

        context
        return undefined;
    };
}
