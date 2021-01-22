import {
  ModelCollection,
  ReadonlyModelCollection,
} from 'shared/domain/ModelCollection';
import { RoleMetricId } from './value-objects/RoleMetricId';
import { RoleMetric, ReadonlyRoleMetric } from './RoleMetric';
import { ReadonlyRole } from '../role/Role';
import { RoleId } from '../role/value-objects/RoleId';
import { ReadonlyReviewTopic } from '../review-topic/ReviewTopic';
import { ReviewTopicId } from '../review-topic/value-objects/ReviewTopicId';
import { ReadonlyMilestone } from '../milestone/Milestone';
import { MilestoneId } from '../milestone/value-objects/MilestoneId';
import { Model } from 'shared/domain/Model';

export interface ReadonlyRoleMetricCollection
  extends ReadonlyModelCollection<RoleMetricId, ReadonlyRoleMetric> {
  whereRole(roleOrId: ReadonlyRole | RoleId): ReadonlyRoleMetricCollection;
  whereReviewTopic(
    reviewTopicOrId: ReadonlyReviewTopic | ReviewTopicId,
  ): ReadonlyRoleMetricCollection;
  whereMilestone(
    milestoneOrId: ReadonlyMilestone | MilestoneId,
  ): ReadonlyRoleMetricCollection;
}

export class RoleMetricCollection
  extends ModelCollection<RoleMetricId, RoleMetric>
  implements ReadonlyRoleMetricCollection {
  public whereRole(
    roleOrId: ReadonlyRole | RoleId,
  ): ReadonlyRoleMetricCollection {
    const id = Model.getId(roleOrId);
    return new RoleMetricCollection(
      this.toArray().filter((rm) => rm.roleId.equals(id)),
    );
  }

  public whereReviewTopic(
    reviewTopicOrId: ReadonlyReviewTopic | ReviewTopicId,
  ): ReadonlyRoleMetricCollection {
    const id = Model.getId(reviewTopicOrId);
    return new RoleMetricCollection(
      this.toArray().filter((rm) => rm.reviewTopicId.equals(id)),
    );
  }

  public whereMilestone(
    milestoneOrId: ReadonlyMilestone | MilestoneId,
  ): ReadonlyRoleMetricCollection {
    const id = Model.getId(milestoneOrId);
    return new RoleMetricCollection(
      this.toArray().filter((rm) => rm.milestoneId.equals(id)),
    );
  }
}
