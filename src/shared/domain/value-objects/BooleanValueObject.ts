import { SingleValueObject } from 'shared/domain/value-objects/SingleValueObject';
import { InvalidBooleanException } from '../exceptions/InvalidBooleanException';
import { ValueObject } from './ValueObject';

/**
 *
 */
export abstract class BooleanValueObject extends SingleValueObject<boolean> {
  protected constructor(value: boolean) {
    super(value);
    this.assertBoolean(value);
  }

  public toString(): string {
    return this.value.toString();
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof BooleanValueObject)) {
      return false;
    }
    return super.equals(other);
  }

  protected assertBoolean(value: boolean): void {
    if (typeof value !== 'boolean') {
      this.throwInvalidValueObjectException();
    }
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidBooleanException();
  }
}
