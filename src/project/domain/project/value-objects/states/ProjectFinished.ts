import {
  DefaultProjectState,
  ProjectState,
} from 'project/domain/project/value-objects/states/ProjectState';
import { Project } from 'project/domain/project/Project';
import { ProjectArchived } from 'project/domain/project/value-objects/states/ProjectArchived';
import { ProjectArchivedEvent } from 'project/domain/events/ProjectArchivedEvent';

export class ProjectFinished extends DefaultProjectState {
  public static readonly INSTANCE: ProjectState = new ProjectFinished();

  private constructor() {
    super();
  }

  public archive(project: Project): void {
    project.state = ProjectArchived.INSTANCE;
    project.raise(new ProjectArchivedEvent(project));
  }
}
