import { SingleValueObject } from 'shared/domain/value-objects/SingleValueObject';
import { InvalidBooleanException } from '../exceptions/InvalidBooleanException';

/**
 *
 */
export abstract class BooleanValueObject<
  T extends BooleanValueObject<T>
> extends SingleValueObject<boolean, T> {
  protected constructor(value: boolean) {
    super(value);
    this.assertBoolean(value);
  }

  public toString(): string {
    return this.value.toString();
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
