import { CancelledProjectState } from 'project/domain/project/value-objects/states/CancelledProjectState';
import { Project } from 'project/domain/project/Project';
import { ProjectCancelledEvent } from 'project/domain/events/ProjectCancelledEvent';
import { ProjectStateDecorator } from 'project/domain/project/value-objects/states/ProjectStateDecorator';

export class CancellableProjectState extends ProjectStateDecorator {
  public cancel(project: Project): void {
    project.state = CancelledProjectState.INSTANCE;
    project.raise(new ProjectCancelledEvent(project));
  }
}
