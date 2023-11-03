import { Rule, SchematicContext, Tree, externalSchematic } from '@angular-devkit/schematics';
import { MyFancyOptionsSchema } from './schema';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function myFancySchematic(options: MyFancyOptionsSchema): Rule {

    const fancy = options.fancy;

    console.log(`This fancy stuff is called ${fancy}`);

    return (_tree: Tree, _context: SchematicContext) => {
        return externalSchematic('@schematics/angular', 'ng-new', {
            name: fancy,
            version: '9.0.0',
            directory: fancy,
            routing: false,
            style: 'scss',
            inlineStyle: false,
            inlineTemplate: false
        });
    };
}
