import {
  DefaultProjectState,
  ProjectState,
} from 'project/domain/project/value-objects/states/ProjectState';

export class ProjectArchived extends DefaultProjectState {
  public static readonly INSTANCE: ProjectState = new ProjectArchived();

  private constructor() {
    super();
  }
}