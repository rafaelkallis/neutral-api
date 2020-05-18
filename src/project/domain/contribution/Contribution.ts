import { Model, ReadonlyModel } from 'shared/domain/Model';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ContributionAmount } from 'project/domain/role/value-objects/ContributionAmount';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { ContributionId } from 'project/domain/contribution/value-objects/ContributionId';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';

export interface ReadonlyContribution extends ReadonlyModel<ContributionId> {
  readonly roleId: RoleId;
  readonly reviewTopicId: ReviewTopicId;
  readonly amount: ContributionAmount;
}

export class Contribution extends Model<ContributionId>
  implements ReadonlyContribution {
  public readonly roleId: RoleId;
  public readonly reviewTopicId: ReviewTopicId;
  public readonly amount: ContributionAmount;

  public constructor(
    id: ContributionId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    roleId: RoleId,
    reviewTopicId: ReviewTopicId,
    amount: ContributionAmount,
  ) {
    super(id, createdAt, updatedAt);
    this.roleId = roleId;
    this.reviewTopicId = reviewTopicId;
    this.amount = amount;
  }

  public static from(
    roleId: RoleId,
    reviewTopicId: ReviewTopicId,
    amount: ContributionAmount,
  ): Contribution {
    const id = ContributionId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    return new Contribution(
      id,
      createdAt,
      updatedAt,
      roleId,
      reviewTopicId,
      amount,
    );
  }
}
