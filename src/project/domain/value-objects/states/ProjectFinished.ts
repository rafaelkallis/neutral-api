import {
  DefaultProjectState,
  ProjectState,
} from 'project/domain/value-objects/states/ProjectState';

export class ProjectFinished extends DefaultProjectState {
  public static readonly INSTANCE: ProjectState = new ProjectFinished();

  private constructor() {
    super();
  }
}
