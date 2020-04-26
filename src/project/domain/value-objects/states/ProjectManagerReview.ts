import { ProjectState } from 'project/domain/value-objects/states/ProjectState';
import { ProjectStateValue } from 'project/domain/value-objects/states/ProjectStateValue';
import { Project } from 'project/domain/Project';
import { ProjectFinished } from 'project/domain/value-objects/states/ProjectFinished';
import { ProjectManagerReviewFinishedEvent } from 'project/domain/events/ProjectManagerReviewFinishedEvent';
import { ProjectFinishedEvent } from 'project/domain/events/ProjectFinishedEvent';

export class ProjectManagerReview extends ProjectState {
  private static readonly INSTANCE = new ProjectManagerReview();
  public static getInstance(): ProjectState {
    return ProjectManagerReview.INSTANCE;
  }

  private constructor() {
    super(ProjectStateValue.MANAGER_REVIEW);
  }

  public submitManagerReview(project: Project): void {
    project.state = ProjectFinished.getInstance();
    project.raise(new ProjectManagerReviewFinishedEvent(project.id));
    project.raise(new ProjectFinishedEvent(project));
  }
}
