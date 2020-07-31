import { registerDecorator, ValidationOptions } from 'class-validator';

function isObject(value: unknown): value is object {
  if (!value) {
    return false;
  }
  return typeof value === 'object';
}

export function IsPeerReviews(options?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isPeerReviews',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown): boolean {
          if (!isObject(value)) {
            return false;
          }
          for (const peerReview of Object.values(value)) {
            if (
              typeof peerReview !== 'number' ||
              isNaN(peerReview) ||
              peerReview < 0 ||
              peerReview > Number.MAX_SAFE_INTEGER
            ) {
              return false;
            }
          }
          return true;
        },
      },
    });
  };
}
