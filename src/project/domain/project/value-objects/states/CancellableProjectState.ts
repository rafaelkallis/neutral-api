import { CancelledProjectState } from 'project/domain/project/value-objects/states/CancelledProjectState';
import { InternalProject } from 'project/domain/project/Project';
import { ProjectCancelledEvent } from 'project/domain/events/ProjectCancelledEvent';
import { OrdinalProjectStateDecorator } from 'project/domain/project/value-objects/states/OrdinalProjectStateDecorator';

export class CancellableProjectState extends OrdinalProjectStateDecorator {
  public cancel(project: InternalProject): void {
    project.state = CancelledProjectState.INSTANCE;
    project.raise(new ProjectCancelledEvent(project));
  }
}
