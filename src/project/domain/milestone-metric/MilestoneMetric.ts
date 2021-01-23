import { Model, ReadonlyModel } from 'shared/domain/Model';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { Class } from 'shared/domain/Class';
import { Project, ReadonlyProject } from '../project/Project';
import { Consensuality } from '../value-objects/Consensuality';
import { Agreement } from '../value-objects/Agreement';
import { ReviewTopicId } from '../review-topic/value-objects/ReviewTopicId';
import { MilestoneId } from '../milestone/value-objects/MilestoneId';
import { MilestoneMetricId } from './MilestoneMetricId';
import { ContributionSymmetry } from '../value-objects/ContributionSymmetry';

export interface ReadonlyMilestoneMetric
  extends ReadonlyModel<MilestoneMetricId> {
  readonly project: ReadonlyProject;
  readonly reviewTopicId: ReviewTopicId;
  readonly milestoneId: MilestoneId;

  readonly contributionSymmetry: ContributionSymmetry;
  readonly consensuality: Consensuality;
  readonly agreement: Agreement;
}

export class MilestoneMetric
  extends Model<MilestoneMetricId>
  implements ReadonlyMilestoneMetric {
  public readonly project: Project;
  public readonly reviewTopicId: ReviewTopicId;
  public readonly milestoneId: MilestoneId;

  public readonly contributionSymmetry: ContributionSymmetry;
  public readonly consensuality: Consensuality;
  public readonly agreement: Agreement;

  /**
   *
   */
  public static create(
    project: Project,
    reviewTopicId: ReviewTopicId,
    milestoneId: MilestoneId,
    contributionSymmetry: ContributionSymmetry,
    consensuality: Consensuality,
    agreement: Agreement,
  ): MilestoneMetric {
    const id = MilestoneMetricId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    return new MilestoneMetric(
      id,
      createdAt,
      updatedAt,
      project,
      reviewTopicId,
      milestoneId,
      contributionSymmetry,
      consensuality,
      agreement,
    );
  }

  public constructor(
    id: MilestoneMetricId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    project: Project,
    reviewTopicId: ReviewTopicId,
    milestoneId: MilestoneId,
    contributionSymmetry: ContributionSymmetry,
    consensuality: Consensuality,
    agreement: Agreement,
  ) {
    super(id, createdAt, updatedAt);
    this.project = project;
    this.reviewTopicId = reviewTopicId;
    this.milestoneId = milestoneId;
    this.contributionSymmetry = contributionSymmetry;
    this.consensuality = consensuality;
    this.agreement = agreement;
  }

  public getClass(): Class<MilestoneMetric> {
    return MilestoneMetric;
  }
}
