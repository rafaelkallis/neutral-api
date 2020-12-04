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
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { DomainException } from 'shared/domain/exceptions/DomainException';

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
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): Promise<void> {
    await project.latestMilestone.submitPeerReviews(
      peerReviews,
      contributionsComputer,
      consensualityComputer,
    );
  }

  public async completePeerReviews(
    project: InternalProject,
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): Promise<void> {
    await project.latestMilestone.completePeerReviews(
      contributionsComputer,
      consensualityComputer,
    );
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
