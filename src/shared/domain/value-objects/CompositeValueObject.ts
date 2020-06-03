import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export abstract class CompositeValueObject<T> extends ValueObject {
  public equals(other: ValueObject): boolean {
    if (!(other instanceof CompositeValueObject)) {
      return false;
    }
    const thisValues = Array.from(this.getAtomicValues());
    const otherValues = Array.from(other.getAtomicValues());
    if (thisValues.length !== otherValues.length) {
      return false;
    }
    for (let i = 0; i < thisValues.length; ++i) {
      if (!thisValues[i].equals(otherValues[i])) {
        return false;
      }
    }
    return true;
  }

  public isValid(): boolean {
    return Array.from(this.getAtomicValues()).every((v) => v.isValid());
  }

  protected abstract getAtomicValues(): Iterable<ValueObject>;
}
