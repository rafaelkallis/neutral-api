import { Project } from 'project/domain/Project';
import { EnumValueObject } from 'common/domain/value-objects/EnumValueObject';
import { InvalidSkipManagerReviewException } from 'project/domain/exceptions/InvalidSkipManagerReviewException';
import { InvariantViolationException } from 'common/exceptions/invariant-violation.exception';

export enum SkipManagerReviewValue {
  YES = 'yes',
  IF_CONSENSUAL = 'if-consensual',
  NO = 'no',
}

function shouldSkipManagerReviewIfConsensual(project: Project): boolean {
  if (!project.consensuality) {
    throw new InvariantViolationException();
  }
  return project.consensuality.isConsensual();
}

/**
 *
 */
export class SkipManagerReview extends EnumValueObject<
  SkipManagerReviewValue,
  SkipManagerReview
> {
  public static readonly YES = new SkipManagerReview(
    SkipManagerReviewValue.YES,
    () => true,
  );
  public static readonly IF_CONSENSUAL = new SkipManagerReview(
    SkipManagerReviewValue.IF_CONSENSUAL,
    shouldSkipManagerReviewIfConsensual,
  );
  public static readonly NO = new SkipManagerReview(
    SkipManagerReviewValue.NO,
    () => false,
  );

  public readonly shouldSkipManagerReview: (project: Project) => boolean;

  private constructor(
    value: SkipManagerReviewValue,
    shouldSkipManagerReview: (project: Project) => boolean,
  ) {
    super(value);
    this.shouldSkipManagerReview = shouldSkipManagerReview;
  }

  /**
   *
   */
  public static from(value: string): SkipManagerReview {
    switch (value) {
      case SkipManagerReviewValue.YES: {
        return SkipManagerReview.YES;
      }
      case SkipManagerReviewValue.IF_CONSENSUAL: {
        return SkipManagerReview.IF_CONSENSUAL;
      }
      case SkipManagerReviewValue.NO: {
        return SkipManagerReview.NO;
      }
      default: {
        throw new InvalidSkipManagerReviewException();
      }
    }
  }

  protected getEnumType(): Record<string, string> {
    return SkipManagerReviewValue;
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidSkipManagerReviewException();
  }
}