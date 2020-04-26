import { ProjectState } from 'project/domain/value-objects/states/ProjectState';
import { ProjectStateValue } from 'project/domain/value-objects/states/ProjectStateValue';

export class ProjectArchived extends ProjectState {
  private static readonly INSTANCE = new ProjectArchived();
  public static getInstance(): ProjectState {
    return ProjectArchived.INSTANCE;
  }

  private constructor() {
    super(ProjectStateValue.ARCHIVED);
  }
}
