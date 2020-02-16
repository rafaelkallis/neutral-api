import { ProjectModel } from 'project/domain/ProjectModel';
import { ConsensualityModelService } from 'project/domain/ConsensualityModelService';
import { InvariantViolationException } from 'common';
import { InternalServerErrorException } from '@nestjs/common';
import { Validator } from 'class-validator';
import { InvalidProjectSettingsException } from 'project/domain/exceptions/InvalidProjectSettingsException';
import { EnumValueObject } from 'common/domain/value-objects/EnumValueObject';

export enum SkipManagerReviewValue {
  YES = 'yes',
  IF_CONSENSUAL = 'if-consensual',
  NO = 'no',
}

/**
 *
 */
export abstract class SkipManagerReview extends EnumValueObject<
  SkipManagerReviewValue,
  SkipManagerReview
> {
  public static YES = SkipManagerReview.from(SkipManagerReviewValue.YES);
  public static IF_CONSENSUAL = SkipManagerReview.from(
    SkipManagerReviewValue.IF_CONSENSUAL,
  );
  public static NO = SkipManagerReview.from(SkipManagerReviewValue.NO);

  /**
   *
   */
  public static from(
    skipManagerReviewValue: SkipManagerReviewValue,
  ): SkipManagerReview {
    const validator = new Validator();
    if (!validator.isEnum(skipManagerReviewValue, SkipManagerReviewValue)) {
      throw new InvalidProjectSettingsException();
    }
    switch (skipManagerReviewValue) {
      case SkipManagerReviewValue.YES: {
        return YesSkipManagerReview.INSTANCE;
      }
      case SkipManagerReviewValue.IF_CONSENSUAL: {
        return IfConsensualSkipManagerReview.INSTANCE;
      }
      case SkipManagerReviewValue.NO: {
        return NoSkipManagerReview.INSTANCE;
      }
      default: {
        throw new InternalServerErrorException();
      }
    }
  }

  /**
   *
   */
  public abstract shouldSkipManagerReview(
    project: ProjectModel,
    consensualityModel: ConsensualityModelService,
  ): boolean;
}

/**
 *
 */
class YesSkipManagerReview extends SkipManagerReview {
  public static readonly INSTANCE = new YesSkipManagerReview();

  private constructor() {
    super();
  }

  /**
   *
   */
  public shouldSkipManagerReview(
    _project: ProjectModel,
    _consensualityModel: ConsensualityModelService,
  ): boolean {
    return true;
  }

  /**
   *
   */
  public toValue(): SkipManagerReviewValue {
    return SkipManagerReviewValue.YES;
  }
}

/**
 *
 */
class IfConsensualSkipManagerReview extends SkipManagerReview {
  public static readonly INSTANCE = new IfConsensualSkipManagerReview();

  private constructor() {
    super();
  }

  /**
   *
   */
  public shouldSkipManagerReview(
    project: ProjectModel,
    consensualityModel: ConsensualityModelService,
  ): boolean {
    if (!project.consensuality) {
      throw new InvariantViolationException();
    }
    return consensualityModel.isConsensual(project.consensuality.value);
  }

  /**
   *
   */
  public toValue(): SkipManagerReviewValue {
    return SkipManagerReviewValue.IF_CONSENSUAL;
  }
}

/**
 *
 */
class NoSkipManagerReview extends SkipManagerReview {
  public static readonly INSTANCE = new NoSkipManagerReview();

  private constructor() {
    super();
  }

  /**
   *
   */
  public shouldSkipManagerReview(
    _project: ProjectModel,
    _consensualityModel: ConsensualityModelService,
  ): boolean {
    return false;
  }

  /**
   *
   */
  public toValue(): SkipManagerReviewValue {
    return SkipManagerReviewValue.NO;
  }
}
