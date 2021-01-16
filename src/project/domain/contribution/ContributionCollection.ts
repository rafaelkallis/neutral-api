import {
  ModelCollection,
  ReadonlyModelCollection,
} from 'shared/domain/ModelCollection';
import { ContributionId } from 'project/domain/contribution/value-objects/ContributionId';
import {
  ReadonlyContribution,
  Contribution,
} from 'project/domain/contribution/Contribution';
import { ReadonlyRole } from 'project/domain/role/Role';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { ReadonlyReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { Model } from 'shared/domain/Model';
import { ReadonlyMilestone } from '../milestone/Milestone';
import { MilestoneId } from '../milestone/value-objects/MilestoneId';

export interface ReadonlyContributionCollection
  extends ReadonlyModelCollection<ContributionId, ReadonlyContribution> {
  where(
    predicate: (contribution: ReadonlyContribution) => boolean,
  ): ReadonlyContributionCollection;
  whereRole(roleOrId: ReadonlyRole | RoleId): ReadonlyContributionCollection;
  whereReviewTopic(
    reviewTopicOrId: ReadonlyReviewTopic | ReviewTopicId,
  ): ReadonlyContributionCollection;
  whereMilestone(
    milestoneOrId: ReadonlyMilestone | MilestoneId,
  ): ReadonlyContributionCollection;
}

export class ContributionCollection
  extends ModelCollection<ContributionId, Contribution>
  implements ReadonlyContributionCollection {
  public where(
    predicate: (contribution: ReadonlyContribution) => boolean,
  ): ContributionCollection {
    return new ContributionCollection(this.toArray().filter(predicate));
  }
  public whereRole(roleOrId: ReadonlyRole | RoleId): ContributionCollection {
    const roleId = Model.getId(roleOrId);
    return this.where((contribution) => contribution.roleId.equals(roleId));
  }

  public whereReviewTopic(
    reviewTopicOrId: ReadonlyReviewTopic | ReviewTopicId,
  ): ContributionCollection {
    const reviewTopicId = Model.getId(reviewTopicOrId);
    return this.where((contribution) =>
      contribution.reviewTopicId.equals(reviewTopicId),
    );
  }

  public whereMilestone(
    milestoneOrId: ReadonlyMilestone | MilestoneId,
  ): ContributionCollection {
    const milestoneId = Model.getId(milestoneOrId);
    return this.where((contribution) =>
      contribution.milestone.id.equals(milestoneId),
    );
  }
}
