const TAB = '    ';

export function customConsoleLog(message: string | string[], title?: string) {

    const hasTitle = !!title && title.length > 0;
    const messageTab = hasTitle ? `${TAB}${TAB}` : TAB;

    console.log('');

    if (hasTitle) {
        console.log(`${TAB}${title}`);
    }

    if (message instanceof Array) {
        for (const m of message) {
            console.log(`${messageTab}${m}`);
        }
    } else {
        console.log(`${messageTab}${message}`);
    }
}
