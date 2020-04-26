import { ProjectState } from 'project/domain/value-objects/states/ProjectState';
import { ProjectStateValue } from 'project/domain/value-objects/states/ProjectStateValue';

export class ProjectFinished extends ProjectState {
  private static readonly INSTANCE = new ProjectFinished();

  public static getInstance(): ProjectState {
    return ProjectFinished.INSTANCE;
  }

  private constructor() {
    super(ProjectStateValue.FINISHED);
  }
}
