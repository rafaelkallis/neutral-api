import { InternalProject } from 'project/domain/project/Project';
import { MilestoneTitle } from 'project/domain/milestone/value-objects/MilestoneTitle';
import { MilestoneDescription } from 'project/domain/milestone/value-objects/MilestoneDescription';
import {
  Milestone,
  ReadonlyMilestone,
} from 'project/domain/milestone/Milestone';
import { ArchivedProjectState } from './ArchivedProjectState';
import { ProjectArchivedEvent } from 'project/domain/events/ProjectArchivedEvent';
import { ProjectState } from './ProjectState';
import { CancellableProjectState } from 'project/domain/project/value-objects/states/CancellableProjectState';

export class ActiveProjectState extends CancellableProjectState {
  public static readonly INSTANCE: ProjectState = new ActiveProjectState();

  private constructor() {
    super();
  }

  protected getOrdinal(): number {
    return 2;
  }

  public addMilestone(
    project: InternalProject,
    title: MilestoneTitle,
    description: MilestoneDescription,
  ): ReadonlyMilestone {
    const milestone = Milestone.create(title, description, project);
    project.milestones.add(milestone);
    return milestone;
  }

  public archive(project: InternalProject): void {
    project.state = ArchivedProjectState.INSTANCE;
    project.raise(new ProjectArchivedEvent(project));
  }
}
