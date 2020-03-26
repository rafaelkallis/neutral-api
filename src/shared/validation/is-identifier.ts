import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsIdentifier(options?: ValidationOptions): PropertyDecorator {
  const hexObjectIdRegex = /^[0-9a-f]{24}$/;
  return function (object: object, propertyName: string | symbol): void {
    if (typeof propertyName === 'symbol') {
      throw new Error('symbols not supported');
    }
    registerDecorator({
      name: 'isIdentifier',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false;
          }
          return hexObjectIdRegex.test(value);
        },
      },
    });
  };
}
