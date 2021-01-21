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
import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { DomainException } from 'shared/domain/exceptions/DomainException';
import { ProjectAnalyzer } from 'project/domain/ProjectAnalyzer';

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
    if (
      !project.milestones.isEmpty() &&
      !project.latestMilestone.isTerminal()
    ) {
      throw new DomainException('pending_milestone', 'A milestone is pending.');
    }
    const milestone = Milestone.create(title, description, project);
    project.milestones.add(milestone);
    return milestone;
  }

  public async submitPeerReviews(
    project: InternalProject,
    peerReviews: ReadonlyPeerReviewCollection,
    projectAnalyzer: ProjectAnalyzer,
  ): Promise<void> {
    await project.latestMilestone.submitPeerReviews(
      peerReviews,
      projectAnalyzer,
    );
  }

  public async completePeerReviews(
    project: InternalProject,
    projectAnalyzer: ProjectAnalyzer,
  ): Promise<void> {
    await project.latestMilestone.completePeerReviews(projectAnalyzer);
  }

  public submitManagerReview(project: InternalProject): void {
    project.latestMilestone.submitManagerReview();
  }

  public archive(project: InternalProject): void {
    if (
      !project.milestones.isEmpty() &&
      !project.latestMilestone.isTerminal()
    ) {
      throw new DomainException('pending_milestone', 'A milestone is pending.');
    }
    project.state = ArchivedProjectState.INSTANCE;
    project.raise(new ProjectArchivedEvent(project));
  }
}
