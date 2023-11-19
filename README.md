# My first angular schematics

* prepare and develop schematics project
* details on schematics

## Links

https://javascript-conference.com/blog/how-to-create-your-own-angular-schematics/


## Preparation and Development

### Pre-requisits

Install schematics dependencies

1) schematics cli

        npm install -g @angular-devkit/schematics-cli

1) angular schematics if needed

        npm install -g @schematics/angular

**TODO install as local dev dependencies in project instead ?!**


### Add schematic to project

    schematics blank --name=<schematic name>


### Building

    npm run build


### Starting (with optional properties)

    npm run start

**As default schematics are started locally in dry run mode, i.e., no files are written to disk !**

As defined by schema.json (which is set in collection.json)
a property `fancy` can be set in different ways

* with prompt

        npm run start

* as `fancy` argument

        npm run start --fancy=<something>

* first command line argument as default

        npm run start <something>


### Unit Testing

run the unit tests, using Jasmine as a runner and test framework

    npm run test


### Publishing

*see https://docs.npmjs.com/creating-and-publishing-private-packages*

#### Publish to official npm registry (use with care !)

    npm publish

To prevent this set `"private": "true"` in the package.json.


#### Publish to local registry

1) set up a local registry -> TODO
1) set registry in package.json

        "publishConfig": {
            "registry": "http://my-internal-registry.local"
        }


#### Install from local path before publishing

1) install package locally

        cd <target project for installation>
        npm install <full path to your package>

    * to uninstall again use `npm uninstall <package name>`

1) execute schematic

        ng generate <package name>:<schematic name> [...schematic arguments]


#### Install from local registry

Instead of publishing to the official npm registry you might want to have a private registry on your local machine or on a server.

See example project `my-local-npm-registry-with-verdaccio` for local registry with verdaccio.


## Some details on angular schematics

official angular-devkit-schematics docs:
*https://github.com/angular/angular-devkit-schematics-builds/blob/main/README.md*

example:
*https://javascript-conference.com/blog/how-to-create-your-own-angular-schematics/*


### Schematic

* a factory which returns a Rule
* rules are applied to a tree to produce a new tree


### Tree and File System

* a tree is the internal representation of the file system
* changes by a schematic are applied to the tree but not to the actual files
* when finished the tree is written to the file system unless it is run in debug mode


### SchematicContext

* contains utility functions and metadata


### Collection

* all schematics of a schematics project are defined in `collection.json` setting a factory and an optional schema (this project here builds all files to a dist folder !)
* these factories are in `src/<schematic name>/index.ts` (or other file name)


### Templating

Templating for schematics might be a mess due to the syntax for placeholders and structural javascript.
* templates are handled by methods of `@angular-devkit/schematics`, e.g.

        apply(
            url('./templates'),
            [
                filter((path) => path.endsWith('.json.template')),
                template({ ...options }),
                renameTemplateFiles(),
            ],
        );

    * the extension `.template` is optional and is removed by `renameTemplateFiles()`

* placeholders in file names are set by `__<placeholder>__`

        __componentName__.fancy.ts.template

* placeholders are set by `<%= ... %>` where a variable can be used which is set in the corresponding javascript scope
    * pass variables as an object to the method `template` of `@angular-devkit/schematics`

            apply(
                url('./<templates folder>'),
                [
                    template({ variable1, ... }),
                ],
            );

    * set variables in structural javascript code within the templates (see next bullet point)
* structural javascript within templates is set by `<% ... %>`
    * it is useful, e.g., to iterate over placeholders
    * variables set in the javascript code are available by placeholders

            <% const asdf = 42 %>
            <%= asdf %>

            <%
                for (const value of [1, 2, 3]) {
            %>
            <%= value %>
            <%
                }
            %>

    * remind that placeholders are not within the javascript code blocks, i.e. the javascript blocks must be interrupted



see also *https://github.com/angular/angular-devkit-schematics-builds/blob/main/README.md*


### more details on the source code of this example project

see git history `;)`
