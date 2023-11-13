import { camelize } from '@angular-devkit/core/src/utils/strings';

// TODO move this to domain (?) as scope augmentation
//      and define the logic as a util function here !?
String.prototype.toUpperCamelCase = function (): string {
    const value = camelize(this.valueOf());
    return value.substring(0, 1).toUpperCase() + value.substring(1);
}
