import {
  ModelCollection,
  ReadonlyModelCollection,
} from 'shared/domain/ModelCollection';
import { MilestoneId } from './value-objects/MilestoneId';
import { Milestone, ReadonlyMilestone } from './Milestone';
import { Model } from 'shared/domain/Model';
import { DomainException } from 'shared/domain/exceptions/DomainException';

export interface ReadonlyMilestoneCollection
  extends ReadonlyModelCollection<MilestoneId, ReadonlyMilestone> {
  assertLatest(milestoneOrId: ReadonlyMilestone | MilestoneId): void;
  whereLatest(): ReadonlyMilestone;
}

export class MilestoneCollection
  extends ModelCollection<MilestoneId, Milestone>
  implements ReadonlyMilestoneCollection {
  public whereLatest(): Milestone {
    let latest = this.first();
    for (const milestone of this) {
      if (milestone.id.compareTo(latest.id) > 0) {
        latest = milestone;
      }
    }
    return latest;
  }

  public assertLatest(milestoneOrId: ReadonlyMilestone | MilestoneId): void {
    const milestoneId = Model.getId(milestoneOrId);
    if (!milestoneId.equals(this.whereLatest().id)) {
      throw new DomainException(
        'not_latest_milestone',
        'Milestone is not the latest.',
      );
    }
  }
}
