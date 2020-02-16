import { InternalServerErrorException } from '@nestjs/common';
import { Validator } from 'class-validator';
import { InvalidContributionVisibilityException } from 'project/domain/exceptions/InvalidContributionVisibility';
import { EnumValueObject } from 'common/domain/value-objects/EnumValueObject';

export enum ContributionVisibilityValue {
  PUBLIC = 'public',
  PROJECT = 'project',
  SELF = 'self',
  NONE = 'none',
}

/**
 *
 */
export abstract class ContributionVisibility extends EnumValueObject<
  ContributionVisibilityValue,
  ContributionVisibility
> {
  public static PUBLIC = ContributionVisibility.from(
    ContributionVisibilityValue.PUBLIC,
  );
  public static PROJECT = ContributionVisibility.from(
    ContributionVisibilityValue.PROJECT,
  );
  public static SELF = ContributionVisibility.from(
    ContributionVisibilityValue.SELF,
  );
  public static NONE = ContributionVisibility.from(
    ContributionVisibilityValue.NONE,
  );

  /**
   *
   */
  public static from(
    value: ContributionVisibilityValue,
  ): ContributionVisibility {
    const validator = new Validator();
    if (!validator.isEnum(value, ContributionVisibilityValue)) {
      throw new InvalidContributionVisibilityException();
    }
    switch (value) {
      case ContributionVisibilityValue.PUBLIC: {
        return PublicContributionVisibility.INSTANCE;
      }
      case ContributionVisibilityValue.PROJECT: {
        return ProjectContributionVisibility.INSTANCE;
      }
      case ContributionVisibilityValue.SELF: {
        return SelfContributionVisibility.INSTANCE;
      }
      case ContributionVisibilityValue.NONE: {
        return NoneContributionVisibility.INSTANCE;
      }
      default: {
        throw new InternalServerErrorException();
      }
    }
  }
}

class PublicContributionVisibility extends ContributionVisibility {
  public static readonly INSTANCE = new PublicContributionVisibility();

  private constructor() {
    super();
  }

  /**
   *
   */
  public toValue(): ContributionVisibilityValue {
    return ContributionVisibilityValue.PUBLIC;
  }
}

class ProjectContributionVisibility extends ContributionVisibility {
  public static readonly INSTANCE = new ProjectContributionVisibility();

  private constructor() {
    super();
  }

  /**
   *
   */
  public toValue(): ContributionVisibilityValue {
    return ContributionVisibilityValue.PROJECT;
  }
}

class SelfContributionVisibility extends ContributionVisibility {
  public static readonly INSTANCE = new SelfContributionVisibility();

  private constructor() {
    super();
  }

  /**
   *
   */
  public toValue(): ContributionVisibilityValue {
    return ContributionVisibilityValue.SELF;
  }
}

class NoneContributionVisibility extends ContributionVisibility {
  public static readonly INSTANCE = new NoneContributionVisibility();

  private constructor() {
    super();
  }

  /**
   *
   */
  public toValue(): ContributionVisibilityValue {
    return ContributionVisibilityValue.NONE;
  }
}
