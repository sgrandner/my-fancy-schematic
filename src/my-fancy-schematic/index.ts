import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function myFancySchematic(_options: any): Rule {

    console.log('asdfas fasdf as');

    return (tree: Tree, _context: SchematicContext) => {
        return tree;
    };
}
