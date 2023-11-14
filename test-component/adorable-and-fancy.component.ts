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

    @Input() anyType: string | number | boolean;

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
    @Input() badAwesomeName: string= 'stefan';
    @Input() genericAwesomeThing: Subject<void | boolean> = new Subject<void | boolean>();


    // alias
    @Input('reallyAwesomeNumber') awesomeNumber: number = 84;


    // inputs on new line (read by \s in regex)
    @Input()
    ridiculousName: string;


    // input setters with optional alias
    @Input() set setStrangeName(localStrangeName: string) {
    }
    @Input('strangeName') set setStrangeName(localStrangeName: string) {
    }


    // typed outputs
    @Output() mouseClick: EventEmitter<void>;

    // untyped initialized outputs
    @Output() mouseClick = new EventEmitter<void>();

    // typed initialized outputs
    @Output() mouseClick: EventEmitter<void> = new EventEmitter<void>();
    @Output() complexMouseClick: EventEmitter<{ [ key: string ]: number }> = new EventEmitter<{ [ key: string ]: number }>();
    @Output() badMouseClick: EventEmitter<void>= new EventEmitter<void>();

    @Output() mouseClick: EventEmitter<void | boolean> = new EventEmitter<void | boolean>();

    // typed outputs with alias
    @Output('catClick') mouseClick: EventEmitter<void>;

    // outputs on new line(read by \s in regex)
    @Output()
    mouseClick: EventEmitter<void>;
}
