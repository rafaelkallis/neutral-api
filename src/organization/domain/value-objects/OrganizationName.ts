import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

export class OrganizationName extends StringValueObject {
  public static of(value: string): OrganizationName {
    return new OrganizationName(value);
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof OrganizationName)) {
      return false;
    }
    return super.equals(other);
  }

  private constructor(value: string) {
    super(value);
    this.assertMaxLength(value, 100);
  }
}
