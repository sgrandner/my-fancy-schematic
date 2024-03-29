export interface ComponentOutput {
    alias: string | undefined;
    name: string | undefined;
    type: string | undefined;
    initializer: string | undefined;
}

export interface ComponentOutputResult {
    name: string;
    complete: string;
}
