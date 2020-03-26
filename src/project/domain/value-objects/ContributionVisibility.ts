import { InvalidContributionVisibilityException } from 'project/domain/exceptions/InvalidContributionVisibility';
import { EnumValueObject } from 'shared/domain/value-objects/EnumValueObject';

export enum ContributionVisibilityValue {
  PUBLIC = 'public',
  PROJECT = 'project',
  SELF = 'self',
  NONE = 'none',
}

/**
 *
 */
export class ContributionVisibility extends EnumValueObject<
  ContributionVisibilityValue,
  ContributionVisibility
> {
  public static readonly PUBLIC = new ContributionVisibility(
    ContributionVisibilityValue.PUBLIC,
  );
  public static readonly PROJECT = new ContributionVisibility(
    ContributionVisibilityValue.PROJECT,
  );
  public static readonly SELF = new ContributionVisibility(
    ContributionVisibilityValue.SELF,
  );
  public static readonly NONE = new ContributionVisibility(
    ContributionVisibilityValue.NONE,
  );

  /**
   *
   */
  public static from(
    value: ContributionVisibilityValue,
  ): ContributionVisibility {
    switch (value) {
      case ContributionVisibilityValue.PUBLIC: {
        return ContributionVisibility.PUBLIC;
      }
      case ContributionVisibilityValue.PROJECT: {
        return ContributionVisibility.PROJECT;
      }
      case ContributionVisibilityValue.SELF: {
        return ContributionVisibility.SELF;
      }
      case ContributionVisibilityValue.NONE: {
        return ContributionVisibility.NONE;
      }
      default: {
        throw new InvalidContributionVisibilityException();
      }
    }
  }

  protected getEnumType(): Record<string, string> {
    return ContributionVisibilityValue;
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidContributionVisibilityException();
  }
}
