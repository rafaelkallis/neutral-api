import { ProjectCancelled } from 'project/domain/value-objects/states/ProjectCancelled';
import { Project } from 'project/domain/Project';
import { ProjectCancelledEvent } from 'project/domain/events/ProjectCancelledEvent';
import { ProjectStateDecorator } from 'project/domain/value-objects/states/ProjectStateDecorator';

export class CancellableState extends ProjectStateDecorator {
  public cancel(project: Project): void {
    project.state = ProjectCancelled.INSTANCE;
    project.raise(new ProjectCancelledEvent(project));
  }
}
