import { InvalidIdException } from 'shared/domain/exceptions/InvalidIdException';
import ObjectID from 'bson-objectid';
import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';

/**
 *
 */
export class Id extends StringValueObject<Id> {
  protected constructor(value: string) {
    super(value);
    this.assertId(value);
  }

  /**
   *
   */
  public static create(): Id {
    return new Id(new ObjectID().toHexString());
  }

  /**
   *
   */
  public static from(id: string): Id {
    return new Id(id);
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

  protected assertId(value: string): void {
    if (!ObjectID.isValid(value)) {
      this.throwInvalidValueObjectException();
    }
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidIdException();
  }
}
