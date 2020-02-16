import { ValueObject } from 'common/domain/ValueObject';
import { Validator } from 'class-validator';
import { InvalidConsensualityException } from 'project/domain/exceptions/InvalidConsensualityException';

/**
 *
 */
export class Consensuality extends ValueObject<Consensuality> {
  public readonly value: number;

  private constructor(value: number) {
    super();
    this.value = value;
  }

  /**
   *
   */
  public static from(value: number): Consensuality {
    const validator = new Validator();
    if (
      !validator.isNumber(value) ||
      !validator.max(value, 1) ||
      !validator.min(value, 0)
    ) {
      throw new InvalidConsensualityException();
    }
    return new Consensuality(value);
  }

  /**
   *
   */
  public equals(other: Consensuality): boolean {
    return this.value === other.value;
  }

  /**
   *
   */
  public toString(): string {
    return this.value.toFixed(1000);
  }
}
