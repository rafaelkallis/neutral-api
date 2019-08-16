import { registerDecorator, ValidationOptions } from "class-validator";

export function IsPeerReviews(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: "isPeerReviews",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (!Array.isArray(value)) {
            return false;
          }
          let hasAtLeastOneZero = false;
          let sum = 0;
          for (const peerReview of value) {
            if (typeof peerReview !== 'number') {
              return false;
            }
            if (isNaN(peerReview)) {
              return false;
            }
            if (peerReview < 0) {
              return false;
            }
            if (peerReview === 0) {
              hasAtLeastOneZero = true;
            }
            sum += peerReview;
          }
          if (!hasAtLeastOneZero) {
            return false;
          }
          if (sum > 1) {
            return false;
          }
          if (sum < 0.99999) {
            return false;
          }
          return true;
        }
      }
    });
  };
}
