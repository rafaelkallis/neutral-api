import { InvalidContributionVisibilityException } from 'project/domain/exceptions/InvalidContributionVisibility';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

export enum ContributionVisibilityValue {
  PUBLIC = 'public',
  PROJECT = 'project',
  SELF = 'self',
  NONE = 'none',
}

function ofValue(value: ContributionVisibilityValue): ContributionVisibility {
  switch (value) {
    case ContributionVisibilityValue.PUBLIC: {
      return PublicContributionVisiblity.INSTANCE;
    }
    case ContributionVisibilityValue.PROJECT: {
      return ProjectContributionVisiblity.INSTANCE;
    }
    case ContributionVisibilityValue.SELF: {
      return SelfContributionVisiblity.INSTANCE;
    }
    case ContributionVisibilityValue.NONE: {
      return NoneContributionVisiblity.INSTANCE;
    }
    default: {
      throw new InvalidContributionVisibilityException();
    }
  }
}

export interface ContributionVisibilityVisitor<T> {
  public(): T;
  project(): T;
  self(): T;
  none(): T;
}

/**
 *
 */
export abstract class ContributionVisibility extends ValueObject {
  public static ofValue(
    value: ContributionVisibilityValue,
  ): ContributionVisibility {
    return ofValue(value);
  }
  // public static readonly PUBLIC = new ContributionVisibility(
  //   ContributionVisibilityValue.PUBLIC,
  // );
  // public static readonly PROJECT = new ContributionVisibility(
  //   ContributionVisibilityValue.PROJECT,
  // );
  // public static readonly SELF = new ContributionVisibility(
  //   ContributionVisibilityValue.SELF,
  // );
  // public static readonly NONE = new ContributionVisibility(
  //   ContributionVisibilityValue.NONE,
  // );

  // public equals(other: ValueObject): boolean {
  //   if (!(other instanceof ContributionVisibility)) {
  //     return false;
  //   }
  //   return super.equals(other);
  // }

  public abstract accept<T>(visitor: ContributionVisibilityVisitor<T>): T;

  public abstract asValue(): ContributionVisibilityValue;

  protected getEnumType(): Record<string, string> {
    return ContributionVisibilityValue;
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidContributionVisibilityException();
  }
}

export class PublicContributionVisiblity extends ContributionVisibility {
  public static readonly INSTANCE = new PublicContributionVisiblity();

  public accept<T>(visitor: ContributionVisibilityVisitor<T>): T {
    return visitor.public();
  }

  public asValue(): ContributionVisibilityValue {
    return ContributionVisibilityValue.PUBLIC;
  }

  private constructor() {
    super();
  }
}

export class ProjectContributionVisiblity extends ContributionVisibility {
  public static readonly INSTANCE = new ProjectContributionVisiblity();

  public accept<T>(visitor: ContributionVisibilityVisitor<T>): T {
    return visitor.project();
  }

  public asValue(): ContributionVisibilityValue {
    return ContributionVisibilityValue.PROJECT;
  }

  private constructor() {
    super();
  }
}

export class SelfContributionVisiblity extends ContributionVisibility {
  public static readonly INSTANCE = new SelfContributionVisiblity();

  public accept<T>(visitor: ContributionVisibilityVisitor<T>): T {
    return visitor.self();
  }

  public asValue(): ContributionVisibilityValue {
    return ContributionVisibilityValue.SELF;
  }

  private constructor() {
    super();
  }
}

export class NoneContributionVisiblity extends ContributionVisibility {
  public static readonly INSTANCE = new NoneContributionVisiblity();

  public accept<T>(visitor: ContributionVisibilityVisitor<T>): T {
    return visitor.none();
  }

  public asValue(): ContributionVisibilityValue {
    return ContributionVisibilityValue.NONE;
  }

  private constructor() {
    super();
  }
}
