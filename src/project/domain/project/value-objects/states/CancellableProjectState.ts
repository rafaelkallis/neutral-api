import { CancelledProjectState } from 'project/domain/project/value-objects/states/CancelledProjectState';
import { InternalProject } from 'project/domain/project/Project';
import { ProjectCancelledEvent } from 'project/domain/events/ProjectCancelledEvent';
import { ProjectState } from 'project/domain/project/value-objects/states/ProjectState';

export abstract class CancellableProjectState extends ProjectState {
  public cancel(project: InternalProject): void {
    if (!project.milestones.isEmpty()) {
      const milestone = project.milestones.whereLatest();
      if (!milestone.isTerminal()) {
        milestone.cancel();
      }
    }
    project.state = CancelledProjectState.INSTANCE;
    project.raise(new ProjectCancelledEvent(project));
  }
}
