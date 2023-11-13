export function fixPath(path: string): string {

    let fixedPath = path;

    if (!fixedPath || fixedPath === '' || fixedPath === '.') {
        fixedPath = './';
    } else {
        if (!fixedPath.startsWith('./')) {
            fixedPath = `./${fixedPath}`;
        }

        if (!fixedPath.endsWith('/')) {
            fixedPath = `${fixedPath}/`;
        }
    }

    return fixedPath;
}
