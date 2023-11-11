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

    // typed inputs - observable
    @Input() asyncName$: Observable<string>;


    // untyped inputs with default value
    @Input() lovelyName = 'stefan';
    @Input() lovelyNumber = 42;


    // typed inputs with default value
    @Input() awesomeName: string = 'stefan';
    @Input() awesomeNumber: number = 42;


    // input setters
    @Input('strangeName') set setStrangeName(strangeName: string) {
    }


    // inputs on new line (maybe read by typed inputs pattern -> new line -> \s)
    @Input()
    ridiculousName: string;
}
