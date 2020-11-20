import {
  ModelCollection,
  ReadonlyModelCollection,
} from 'shared/domain/ModelCollection';
import { MilestoneId } from './value-objects/MilestoneId';
import { Milestone, ReadonlyMilestone } from './Milestone';
import { DomainException } from 'shared/domain/exceptions/DomainException';

export interface ReadonlyMilestoneCollection
  extends ReadonlyModelCollection<MilestoneId, ReadonlyMilestone> {
  assertSufficientAmount(): void;
}

export class MilestoneCollection
  extends ModelCollection<MilestoneId, Milestone>
  implements ReadonlyMilestoneCollection {
  public assertSufficientAmount(): void {
    if (this.toArray().length < 1) {
      throw new DomainException(
        'insufficient_milestone_amount',
        'Insufficient number of milestones.',
      );
    }
  }
}
