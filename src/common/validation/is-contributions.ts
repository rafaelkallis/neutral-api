import { registerDecorator, ValidationOptions } from 'class-validator';

function isObject(value: unknown): value is object {
  if (!value) {
    return false;
  }
  return typeof value === 'object';
}

export function IsContributions(options?: ValidationOptions) {
  return function(object: object, propertyName: string): void {
    registerDecorator({
      name: 'isContributions',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown): boolean {
          if (!isObject(value)) {
            return false;
          }
          let sum = 0;
          for (const contribution of Object.values(value)) {
            if (
              typeof contribution !== 'number' ||
              isNaN(contribution) ||
              contribution < 0
            ) {
              return false;
            }
            sum += contribution;
          }
          if (sum < 0.99999 || sum > 1) {
            return false;
          }
          return true;
        },
      },
    });
  };
}
