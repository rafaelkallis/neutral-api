import {
  DefaultProjectState,
  ProjectState,
} from 'project/domain/project/value-objects/states/ProjectState';

export class ArchivedProjectState extends DefaultProjectState {
  public static readonly INSTANCE: ProjectState = new ArchivedProjectState();

  private constructor() {
    super();
  }
}
