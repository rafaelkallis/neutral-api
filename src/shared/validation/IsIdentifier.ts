import {
  registerDecorator,
  ValidationOptions,
  isMongoId,
} from 'class-validator';

export function IsIdentifier(options?: ValidationOptions): PropertyDecorator {
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
          return isMongoId(value);
        },
      },
    });
  };
}
