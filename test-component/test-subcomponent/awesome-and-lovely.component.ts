class AdorableAndFancyComponent {

    // untyped inputs
    @Input() subAdorableThing;


    // typed inputs
    @Input() subAdorableName: string;
    @Input() subAdorableNumber: number;
    @Input() subAdorableObject: { [ key: string ]: number };

    // typed inputs - optional
    @Input() subMaybeName?: string;

    // typed inputs - with assertion
    @Input() subSureName!: string;

    // typed inputs - generics
    @Input() subAsyncName$: Observable<string>;
    @Input() subAsyncArray$: Observable<number[]>;
    @Input() subAsyncObject$: Observable<{ [ key: string ]: number[] }>;


    // untyped inputs with default value
    @Input() subLovelyName = 'stefan';
    @Input() subLovelyNumber = 42;
    @Input() subLovelyObject = { [ 'asdf' ]: [ 1, 2, 3, 'sdfg' ] };


    // typed inputs with default value
    @Input() subAwesomeName: string = 'stefan';
    @Input() subAwesomeNumber: number = 42;
    @Input() subBadAwesomeName: string= 'stefan';


    // alias
    @Input('reallyAwesomeNumber') subAwesomeNumber: number = 84;


    // inputs on new line (read by \s in regex)
    @Input()
    subRidiculousName: string;


    // input setters with optional alias
    @Input() set setSubStrangeName(localSubStrangeName: string) {
    }
    @Input('subStrangeName') set setSubStrangeName(localSubStrangeName: string) {
    }


    // typed outputs
    @Output() subMouseClick: EventEmitter<void>;

    // untyped initialized outputs
    @Output() subMouseClick = new EventEmitter<void>();

    // typed initialized outputs
    @Output() subMouseClick: EventEmitter<void> = new EventEmitter<void>();
    @Output() subComplexMouseClick: EventEmitter<{ [ key: string ]: number }> = new EventEmitter<{ [ key: string ]: number }>();
    @Output() subBadMouseClick: EventEmitter<void>= new EventEmitter<void>();

    // typed outputs with alias
    @Output('subCatClick') subMouseClick: EventEmitter<void>;

    // outputs on new line(read by \s in regex)
    @Output()
    subMouseClick: EventEmitter<void>;
}
