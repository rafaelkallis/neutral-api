import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { InvalidIdException } from 'shared/domain/exceptions/InvalidIdException';
import ObjectID from 'bson-objectid';

/**
 *
 */
export class Id extends ValueObject<Id> {
  public readonly value: string;

  protected constructor(value: string) {
    super();
    this.value = value;
    this.assertId();
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

  protected assertId(): void {
    if (!ObjectID.isValid(this.value)) {
      throw new InvalidIdException();
    }
  }
}
