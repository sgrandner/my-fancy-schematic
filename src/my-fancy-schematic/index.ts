import { Rule, SchematicContext, Tree, externalSchematic } from '@angular-devkit/schematics';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function myFancySchematic(_options: any): Rule {

    const fancy = _options.fancy;

    console.log(`This fancy stuff is called ${fancy}`);

    return (_: Tree, _context: SchematicContext) => {
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
