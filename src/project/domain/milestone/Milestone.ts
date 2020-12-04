import { Model, ReadonlyModel } from 'shared/domain/Model';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { Class } from 'shared/domain/Class';
import { MilestoneId } from './value-objects/MilestoneId';
import { MilestoneTitle } from './value-objects/MilestoneTitle';
import { MilestoneDescription } from './value-objects/MilestoneDescription';
import { Project, ReadonlyProject } from '../project/Project';
import { ReadonlyPeerReviewCollection } from '../peer-review/PeerReviewCollection';
import { MilestoneState } from './value-objects/states/MilestoneState';
import { ContributionsComputer } from '../ContributionsComputer';
import { ConsensualityComputer } from '../ConsensualityComputer';
import { PeerReviewMilestoneState } from './value-objects/states/PeerReviewMilestoneState';
import { MilestoneCreatedEvent } from './events/MilestoneCreatedEvent';
import { PeerReviewStartedEvent } from './events/PeerReviewStartedEvent';

export interface ReadonlyMilestone extends ReadonlyModel<MilestoneId> {
  readonly title: MilestoneTitle;
  readonly description: MilestoneDescription;
  readonly state: MilestoneState;

  readonly project: ReadonlyProject;
  readonly peerReviews: ReadonlyPeerReviewCollection;

  isTerminal(): boolean;
}

export abstract class Milestone
  extends Model<MilestoneId>
  implements ReadonlyMilestone {
  public abstract readonly title: MilestoneTitle;
  public abstract readonly description: MilestoneDescription;
  public abstract readonly state: MilestoneState;

  public abstract readonly project: Project;

  /**
   * Cancel the milestone.
   */
  public abstract cancel(): void;

  /**
   *
   */
  public abstract submitPeerReviews(
    peerReviews: ReadonlyPeerReviewCollection,
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): Promise<void>;

  public abstract completePeerReviews(
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): Promise<void>;

  /**
   * Submit the manager review.
   */
  public abstract submitManagerReview(): void;

  /**
   *
   */
  public static create(
    title: MilestoneTitle,
    description: MilestoneDescription,
    project: Project,
  ): Milestone {
    const id = MilestoneId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const state = PeerReviewMilestoneState.INSTANCE;
    const milestone = new InternalMilestone(
      id,
      createdAt,
      updatedAt,
      title,
      description,
      state,
      project,
    );
    project.raise(new MilestoneCreatedEvent(milestone));
    project.raise(new PeerReviewStartedEvent(milestone));
    return milestone;
  }

  /**
   *
   */
  public static of(
    id: MilestoneId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    title: MilestoneTitle,
    description: MilestoneDescription,
    state: MilestoneState,
    project: Project,
  ): Milestone {
    return new InternalMilestone(
      id,
      createdAt,
      updatedAt,
      title,
      description,
      state,
      project,
    );
  }

  public get peerReviews(): ReadonlyPeerReviewCollection {
    return this.project.peerReviews.whereMilestone(this);
  }

  public isTerminal(): boolean {
    return this.state.isTerminal();
  }

  public getClass(): Class<Milestone> {
    return Milestone;
  }
}

export class InternalMilestone extends Milestone {
  public title: MilestoneTitle;
  public description: MilestoneDescription;
  public state: MilestoneState;

  public project: Project;

  public constructor(
    id: MilestoneId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    title: MilestoneTitle,
    description: MilestoneDescription,
    state: MilestoneState,
    project: Project,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
    this.state = state;
    this.project = project;
  }

  public cancel(): void {
    this.state.cancel(this);
  }

  public async submitPeerReviews(
    peerReviews: ReadonlyPeerReviewCollection,
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): Promise<void> {
    await this.state.submitPeerReviews(
      this,
      peerReviews,
      contributionsComputer,
      consensualityComputer,
    );
  }

  public async completePeerReviews(
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): Promise<void> {
    await this.state.completePeerReviews(
      this,
      contributionsComputer,
      consensualityComputer,
    );
  }

  public submitManagerReview(): void {
    this.state.submitManagerReview(this);
  }
}
