import { Model, ReadonlyModel } from 'shared/domain/Model';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { Class } from 'shared/domain/Class';
import { RoleMetricId } from './value-objects/RoleMetricId';
import { Project, ReadonlyProject } from '../project/Project';
import { Consensuality } from './value-objects/Consensuality';
import { Agreement } from './value-objects/Agreement';
import { Contribution } from './value-objects/Contribution';
import { RoleId } from '../role/value-objects/RoleId';
import { ReviewTopicId } from '../review-topic/value-objects/ReviewTopicId';
import { MilestoneId } from '../milestone/value-objects/MilestoneId';

export interface ReadonlyRoleMetric extends ReadonlyModel<RoleMetricId> {
  readonly project: ReadonlyProject;
  readonly roleId: RoleId;
  readonly reviewTopicId: ReviewTopicId;
  readonly milestoneId: MilestoneId;

  readonly contribution: Contribution;
  readonly consensuality: Consensuality;
  readonly agreement: Agreement;
}

export class RoleMetric
  extends Model<RoleMetricId>
  implements ReadonlyRoleMetric {
  public readonly project: Project;
  public readonly roleId: RoleId;
  public readonly reviewTopicId: ReviewTopicId;
  public readonly milestoneId: MilestoneId;

  public readonly contribution: Contribution;
  public readonly consensuality: Consensuality;
  public readonly agreement: Agreement;

  /**
   *
   */
  public static create(
    project: Project,
    roleId: RoleId,
    reviewTopicId: ReviewTopicId,
    milestoneId: MilestoneId,
    contribution: Contribution,
    consensuality: Consensuality,
    agreement: Agreement,
  ): RoleMetric {
    const id = RoleMetricId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    return new RoleMetric(
      id,
      createdAt,
      updatedAt,
      project,
      roleId,
      reviewTopicId,
      milestoneId,
      contribution,
      consensuality,
      agreement,
    );
  }

  public constructor(
    id: RoleMetricId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    project: Project,
    roleId: RoleId,
    reviewTopicId: ReviewTopicId,
    milestoneId: MilestoneId,
    contribution: Contribution,
    consensuality: Consensuality,
    agreement: Agreement,
  ) {
    super(id, createdAt, updatedAt);
    this.project = project;
    this.roleId = roleId;
    this.reviewTopicId = reviewTopicId;
    this.milestoneId = milestoneId;
    this.contribution = contribution;
    this.consensuality = consensuality;
    this.agreement = agreement;
  }

  public getClass(): Class<RoleMetric> {
    return RoleMetric;
  }
}
