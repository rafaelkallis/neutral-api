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

export interface ReadonlyContributionCollection
  extends ReadonlyModelCollection<ContributionId, ReadonlyContribution> {
  where(
    predicate: (contribution: ReadonlyContribution) => boolean,
  ): ReadonlyContributionCollection;
  whereRole(roleOrId: ReadonlyRole | RoleId): ReadonlyContributionCollection;
  whereReviewTopic(
    reviewTopicOrId: ReadonlyReviewTopic | ReviewTopicId,
  ): ReadonlyContributionCollection;
}

export class ContributionCollection
  extends ModelCollection<ContributionId, Contribution>
  implements ReadonlyContributionCollection {
  public where(
    predicate: (contribution: ReadonlyContribution) => boolean,
  ): ReadonlyContributionCollection {
    return new ContributionCollection(this.toArray().filter(predicate));
  }
  public whereRole(
    roleOrId: ReadonlyRole | RoleId,
  ): ReadonlyContributionCollection {
    const roleId = this.getId(roleOrId);
    return this.where((contribution) => contribution.roleId.equals(roleId));
  }

  public whereReviewTopic(
    reviewTopicOrId: ReadonlyReviewTopic | ReviewTopicId,
  ): ReadonlyContributionCollection {
    const reviewTopicId = this.getId(reviewTopicOrId);
    return this.where((contribution) =>
      contribution.reviewTopicId.equals(reviewTopicId),
    );
  }
}
