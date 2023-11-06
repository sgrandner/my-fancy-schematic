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

    npm publish
