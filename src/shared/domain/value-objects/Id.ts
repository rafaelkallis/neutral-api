import { InvalidIdException } from 'shared/domain/exceptions/InvalidIdException';
import ObjectID from 'bson-objectid';
import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';
import { ValueObject } from './ValueObject';

/**
 *
 */
export abstract class Id extends StringValueObject {
  protected constructor(value: string) {
    super(value);
    this.assertObjectId(value);
  }

  /**
   *
   */
  protected static createObjectId(): string {
    return new ObjectID().toHexString();
  }

  public equals(otherValueObject: ValueObject): boolean {
    if (!(otherValueObject instanceof Id)) {
      return false;
    }
    return super.equals(otherValueObject);
  }

  /**
   *
   */
  public lessThan(otherId: Id): boolean {
    return this.value < otherId.value;
  }

  /**
   *
   */
  public getTimestamp(): number {
    return new ObjectID(this.value).getTimestamp();
  }

  private assertObjectId(value: string): void {
    if (!ObjectID.isValid(value)) {
      this.throwInvalidValueObjectException();
    }
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidIdException();
  }
}
