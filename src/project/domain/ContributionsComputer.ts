import { Contribution } from 'project/domain/contribution/Contribution';
import { ContributionCollection } from './contribution/ContributionCollection';
import { ReadonlyMilestone } from './milestone/Milestone';
import { ContributionAmount } from './role/value-objects/ContributionAmount';
import { RoleId } from './role/value-objects/RoleId';

/**
 * Contributions Computer
 */
export abstract class ContributionsComputer {
  /**
   * Computes the relative contributions.
   */
  public compute(milestone: ReadonlyMilestone): ContributionCollection {
    const result = new ContributionCollection([]);
    for (const reviewTopic of milestone.project.reviewTopics) {
      const peerReviews = milestone.peerReviews
        .whereReviewTopic(reviewTopic.id)
        .toNormalizedMap();
      const contributions = this.doCompute(peerReviews);
      for (const [roleId, contributionAmount] of Object.entries(
        contributions,
      )) {
        result.add(
          Contribution.from(
            milestone,
            RoleId.from(roleId),
            reviewTopic.id,
            ContributionAmount.from(contributionAmount),
          ),
        );
      }
    }
    return result;
  }

  protected abstract doCompute(
    peerReviews: Record<string, Record<string, number>>,
  ): Record<string, number>;
}
