import {
  ModelCollection,
  ReadonlyModelCollection,
} from 'shared/domain/ModelCollection';
import { MilestoneMetric, ReadonlyMilestoneMetric } from './MilestoneMetric';
import { MilestoneMetricId } from './MilestoneMetricId';
import { ReadonlyReviewTopic } from '../review-topic/ReviewTopic';
import { ReviewTopicId } from '../review-topic/value-objects/ReviewTopicId';
import { ReadonlyMilestone } from '../milestone/Milestone';
import { MilestoneId } from '../milestone/value-objects/MilestoneId';
import { Model } from 'shared/domain/Model';

export interface ReadonlyMilestoneMetricCollection
  extends ReadonlyModelCollection<MilestoneMetricId, ReadonlyMilestoneMetric> {
  whereReviewTopic(
    reviewTopicOrId: ReadonlyReviewTopic | ReviewTopicId,
  ): ReadonlyMilestoneMetricCollection;
  whereMilestone(
    milestoneOrId: ReadonlyMilestone | MilestoneId,
  ): ReadonlyMilestoneMetricCollection;
}

export class MilestoneMetricCollection
  extends ModelCollection<MilestoneMetricId, MilestoneMetric>
  implements ReadonlyMilestoneMetricCollection {
  public whereReviewTopic(
    reviewTopicOrId: ReadonlyReviewTopic | ReviewTopicId,
  ): ReadonlyMilestoneMetricCollection {
    const id = Model.getId(reviewTopicOrId);
    return new MilestoneMetricCollection(
      this.toArray().filter((rm) => rm.reviewTopicId.equals(id)),
    );
  }

  public whereMilestone(
    milestoneOrId: ReadonlyMilestone | MilestoneId,
  ): ReadonlyMilestoneMetricCollection {
    const id = Model.getId(milestoneOrId);
    return new MilestoneMetricCollection(
      this.toArray().filter((rm) => rm.milestoneId.equals(id)),
    );
  }
}
