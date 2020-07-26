import { InternalProject } from 'project/domain/project/Project';
import { FinishedProjectState } from 'project/domain/project/value-objects/states/FinishedProjectState';
import { ProjectManagerReviewFinishedEvent } from 'project/domain/events/ProjectManagerReviewFinishedEvent';
import { ProjectFinishedEvent } from 'project/domain/events/ProjectFinishedEvent';
import { CancellableProjectState } from 'project/domain/project/value-objects/states/CancellableProjectState';
import {
  DefaultOrdinalProjectState,
  OrdinalProjectState,
} from './OrdinalProjectState';

export class ManagerReviewProjectState extends DefaultOrdinalProjectState {
  public static readonly INSTANCE: OrdinalProjectState = new CancellableProjectState(
    new ManagerReviewProjectState(),
  );

  public getOrdinal(): number {
    return 2;
  }

  public submitManagerReview(project: InternalProject): void {
    project.state = FinishedProjectState.INSTANCE;
    project.raise(new ProjectManagerReviewFinishedEvent(project.id));
    project.raise(new ProjectFinishedEvent(project));
  }

  private constructor() {
    super();
  }
}
