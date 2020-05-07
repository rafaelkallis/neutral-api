import {
  DefaultProjectState,
  ProjectState,
} from 'project/domain/project/value-objects/states/ProjectState';
import { Project } from 'project/domain/project/Project';
import { ArchivedProjectState } from 'project/domain/project/value-objects/states/ArchivedProjectState';
import { ProjectArchivedEvent } from 'project/domain/events/ProjectArchivedEvent';

export class FinishedProjectState extends DefaultProjectState {
  public static readonly INSTANCE: ProjectState = new FinishedProjectState();

  private constructor() {
    super();
  }

  public archive(project: Project): void {
    project.state = ArchivedProjectState.INSTANCE;
    project.raise(new ProjectArchivedEvent(project));
  }
}
