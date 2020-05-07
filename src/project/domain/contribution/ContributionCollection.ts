import {
  ModelCollection,
  ReadonlyModelCollection,
} from 'shared/domain/ModelCollection';
import { ContributionId } from 'project/domain/contribution/value-objects/ContributionId';
import {
  ReadonlyContribution,
  Contribution,
} from 'project/domain/contribution/Contribution';
import { Role } from 'project/domain/role/Role';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';

export interface ReadonlyContributionCollection
  extends ReadonlyModelCollection<ContributionId, ReadonlyContribution> {
  findByRole(roleOrId: Role | RoleId): ReadonlyContributionCollection;
  findByReviewTopic(
    reviewTopicOrId: ReviewTopic | ReviewTopicId,
  ): ReadonlyContributionCollection;
}

export class ContributionCollection
  extends ModelCollection<ContributionId, Contribution>
  implements ReadonlyContributionCollection {
  public findByRole(roleOrId: Role | RoleId): ReadonlyContributionCollection {
    const roleId = this.getId(roleOrId);
    return this.filter((contribution) => contribution.roleId.equals(roleId));
  }

  public findByReviewTopic(
    reviewTopicOrId: ReviewTopic | ReviewTopicId,
  ): ReadonlyContributionCollection {
    const reviewTopicId = this.getId(reviewTopicOrId);
    return this.filter((contribution) =>
      contribution.reviewTopicId.equals(reviewTopicId),
    );
  }

  private filter(
    predicate: (contribution: Contribution) => boolean,
  ): ReadonlyContributionCollection {
    return new ContributionCollection(this.toArray().filter(predicate));
  }
}
