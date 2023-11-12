import { camelize } from '@angular-devkit/core/src/utils/strings';

String.prototype.toUpperCamelCase = function (): string {
    const value = camelize(this.valueOf());
    return value.substring(0, 1).toUpperCase() + value.substring(1);
}
