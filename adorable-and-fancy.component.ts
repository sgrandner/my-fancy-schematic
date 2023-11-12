class AdorableAndFancyComponent {

    // untyped inputs
    @Input() adorableThing;


    // typed inputs
    @Input() adorableName: string;
    @Input() adorableNumber: number;
    @Input() adorableObject: { [ key: string ]: number };

    // typed inputs - optional
    @Input() maybeName?: string;

    // typed inputs - with assertion
    @Input() sureName!: string;

    // typed inputs - generics
    @Input() asyncName$: Observable<string>;
    @Input() asyncArray$: Observable<number[]>;
    @Input() asyncObject$: Observable<{ [ key: string ]: number[] }>;


    // untyped inputs with default value
    @Input() lovelyName = 'stefan';
    @Input() lovelyNumber = 42;
    @Input() lovelyObject = { [ 'asdf' ]: [ 1, 2, 3, 'sdfg' ] };


    // typed inputs with default value
    @Input() awesomeName: string = 'stefan';
    @Input() awesomeNumber: number = 42;


    // alias
    @Input('reallyAwesomeNumber') awesomeNumber: number = 84;


    // inputs on new line (read by \s in regex)
    @Input()
    ridiculousName: string;


    // TODO input setters with optional alias
    @Input() set setStrangeName(locaStrangeName: string) {
    }
    @Input('strangeName') set setStrangeName(locaStrangeName: string) {
    }
}
