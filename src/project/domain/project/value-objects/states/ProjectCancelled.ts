import {
  ProjectState,
  DefaultProjectState,
} from 'project/domain/project/value-objects/states/ProjectState';

export class ProjectCancelled extends DefaultProjectState {
  public static readonly INSTANCE: ProjectState = new ProjectCancelled();

  private constructor() {
    super();
  }
}
