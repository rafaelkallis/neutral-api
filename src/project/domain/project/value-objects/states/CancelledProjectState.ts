import {
  ProjectState,
  DefaultProjectState,
} from 'project/domain/project/value-objects/states/ProjectState';

export class CancelledProjectState extends DefaultProjectState {
  public static readonly INSTANCE: ProjectState = new CancelledProjectState();

  private constructor() {
    super();
  }
}
