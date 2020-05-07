import {
  DefaultProjectState,
  ProjectState,
} from 'project/domain/project/value-objects/states/ProjectState';
import { Project } from 'project/domain/project/Project';
import { FinishedProjectState } from 'project/domain/project/value-objects/states/FinishedProjectState';
import { ProjectManagerReviewFinishedEvent } from 'project/domain/events/ProjectManagerReviewFinishedEvent';
import { ProjectFinishedEvent } from 'project/domain/events/ProjectFinishedEvent';
import { CancellableProjectState } from 'project/domain/project/value-objects/states/CancellableProjectState';

export class ProjectManagerReview extends DefaultProjectState {
  public static readonly INSTANCE: ProjectState = new CancellableProjectState(
    new ProjectManagerReview(),
  );

  private constructor() {
    super();
  }

  public submitManagerReview(project: Project): void {
    project.state = FinishedProjectState.INSTANCE;
    project.raise(new ProjectManagerReviewFinishedEvent(project.id));
    project.raise(new ProjectFinishedEvent(project));
  }
}
