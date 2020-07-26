import { InternalProject } from 'project/domain/project/Project';
import { ArchivedProjectState } from 'project/domain/project/value-objects/states/ArchivedProjectState';
import { ProjectArchivedEvent } from 'project/domain/events/ProjectArchivedEvent';
import {
  DefaultOrdinalProjectState,
  OrdinalProjectState,
} from './OrdinalProjectState';

export class FinishedProjectState extends DefaultOrdinalProjectState {
  public static readonly INSTANCE: OrdinalProjectState = new FinishedProjectState();

  public getOrdinal(): number {
    return 3;
  }

  public archive(project: InternalProject): void {
    project.state = ArchivedProjectState.INSTANCE;
    project.raise(new ProjectArchivedEvent(project));
  }

  private constructor() {
    super();
  }
}
