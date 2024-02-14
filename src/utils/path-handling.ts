import path = require('path');
import * as findParentDir from 'find-parent-dir';

/**
 * The given path is sanitized and returned if a non-empty path parameter is passed
 * and the working directory (from where this was called)
 * equals the root directory of the project. Else an error is thrown.
 *
 * For an empty path parameter passed to this method the relative path
 * is determined automatically by the working and the root directory
 * of the project where ".git" folder is located.
 * -> TODO Better way to determine nodejs project root ?!
 *
 * In case of success the working directory is changed to the root directory
 * of the project !!!
 *
 * This is necessary because "schematics" and "fs" handle paths differently, i.e.,
 * "fs" works on the working directory whereas "schematics" work on the project's
 * root directory. Well, more or less...
 *
 * @param givenRelativePath Path string relative to nodejs project root or empty, i.e.
 *                          undefined, '' or '.'
 * @returns Sanitized path relative to nodejs project root to given target folder
 *          or to folder it was called from if target is not given
 */
export function setWorkingToProjectRootDirAndReturnTargetPath(givenRelativePath: string): string {

    const workingDir = process.env.INIT_CWD ?? process.cwd();
    const rootDir = findParentDir.sync(workingDir, '.git');

    if (!workingDir) {
        throw new Error('working directory could not be determined !');
    }
    if (!rootDir) {
        throw new Error('app\'s root directory could not be determined !');
    }

    let resultPath = givenRelativePath;

    if (!givenRelativePath || givenRelativePath === '' || givenRelativePath === '.') {
        resultPath = path.relative(rootDir, workingDir);
    } else if (workingDir !== rootDir) {
        throw new Error('when inserting a target path the schematic must be called from the app\'s root directory !');
    }

    if (!resultPath.startsWith('./')) {
        resultPath = `./${resultPath}`;
    }

    if (!resultPath.endsWith('/')) {
        resultPath = `${resultPath}/`;
    }

    console.log(`    change working directory to project root directory ${rootDir} ...`);
    process.chdir(rootDir);

    return resultPath;
}
