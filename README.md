# My Fancy Schematic


### Building

    npm run build


### Starting (with optional properties)

    npm run start

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
