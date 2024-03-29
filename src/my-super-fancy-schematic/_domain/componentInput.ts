export interface ComponentInput {
    alias: string | undefined;
    name: string | undefined;
    type: string | undefined;
    value: string | undefined;
    setterType: string | undefined;
}

export interface ComponentInputResult {
    name: string;
    complete: string;
}
