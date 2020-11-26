import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { MilestoneId } from 'project/domain/milestone/value-objects/MilestoneId';

@DomainEventKey('project.milestone_cancelled')
export class MilestoneCancelledEvent extends DomainEvent {
  public readonly projectId: ProjectId;
  public readonly milestoneId: MilestoneId;

  public constructor(projectId: ProjectId, milestoneId: MilestoneId) {
    super();
    this.projectId = projectId;
    this.milestoneId = milestoneId;
  }
}
