import { ProjectState } from 'project/domain/project/value-objects/states/ProjectState';

export class ArchivedProjectState extends ProjectState {
  public static readonly INSTANCE: ProjectState = new ArchivedProjectState();

  public getOrdinal(): number {
    return 3;
  }

  private constructor() {
    super();
  }
}
