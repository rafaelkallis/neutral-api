import { ValueObject } from 'common/domain/ValueObject';
import { Validator } from 'class-validator';
import { InvalidIdException } from 'common/domain/exceptions/InvalidIdException';
import ObjectID from 'bson-objectid';

/**
 *
 */
export class Id extends ValueObject<Id> {
  public readonly value: string;

  protected constructor(value: string) {
    super();
    const validator = new Validator();
    if (!validator.isMongoId(value) || !validator.maxLength(value, 24)) {
      throw new InvalidIdException();
    }
    this.value = value;
  }

  /**
   *
   */
  public static create(): Id {
    return Id.from(new ObjectID().toHexString());
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
  public equals(otherId: Id): boolean {
    return this.value === otherId.value;
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

  /**
   *
   */
  public toString(): string {
    return this.value;
  }
}
