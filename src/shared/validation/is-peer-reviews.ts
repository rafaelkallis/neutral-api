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
          let sum = 0;
          for (const peerReview of Object.values(value)) {
            if (
              typeof peerReview !== 'number' ||
              isNaN(peerReview) ||
              peerReview < 0
            ) {
              return false;
            }
            sum += peerReview;
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
