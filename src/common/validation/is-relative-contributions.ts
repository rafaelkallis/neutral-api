import { registerDecorator, ValidationOptions } from 'class-validator';

function isObject(value: unknown): value is object {
  if (!value) {
    return false;
  }
  return typeof value === 'object';
}

export function IsRelativeContributions(options?: ValidationOptions) {
  return function(object: object, propertyName: string): void {
    registerDecorator({
      name: 'isRelativeContributions',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown): boolean {
          if (!isObject(value)) {
            return false;
          }
          let sum = 0;
          for (const relativeContribution of Object.values(value)) {
            if (
              typeof relativeContribution !== 'number' ||
              isNaN(relativeContribution) ||
              relativeContribution < 0
            ) {
              return false;
            }
            sum += relativeContribution;
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
