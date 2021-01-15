import { InvalidIdException } from 'shared/domain/exceptions/InvalidIdException';
import ObjectID from 'bson-objectid';
import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';
import { ValueObject } from './ValueObject';
import { Comprarable } from './Comparable';

/**
 *
 */
export abstract class Id extends StringValueObject implements Comprarable<Id> {
  protected constructor(value: string) {
    super(value);
    this.assertObjectId(value);
  }

  /**
   *
   */
  protected static createInner(): string {
    return ObjectID.generate();
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
    return ObjectID.createFromHexString(this.value).getTimestamp();
  }

  public compareTo(other: Id): number {
    return Number(BigInt('0x' + this.value) - BigInt('0x' + other.value));
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
