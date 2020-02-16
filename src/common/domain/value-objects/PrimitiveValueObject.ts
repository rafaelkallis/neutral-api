import { ValueObject } from 'common/domain/ValueObject';

/**
 *
 */
export abstract class PrimitiveValueObject<
  T,
  VO extends PrimitiveValueObject<T, VO>
> extends ValueObject<VO> {
  public readonly value: T;

  protected constructor(value: T) {
    super();
    this.value = value;
  }

  /**
   *
   */
  public equals(other: PrimitiveValueObject<T, VO>): boolean {
    return this.value === other.value;
  }
}
