import { ProjectState } from 'project/domain/project/value-objects/states/ProjectState';

export class CancelledProjectState extends ProjectState {
  public static readonly INSTANCE: ProjectState = new CancelledProjectState();

  private constructor() {
    super();
  }

  protected getOrdinal(): number {
    return -1;
  }
}
