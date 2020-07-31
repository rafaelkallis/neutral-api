import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { ReadonlyPeerReview } from 'project/domain/peer-review/PeerReview';
import { ReadonlyUser } from 'user/domain/User';
import { ReadonlyProject } from '../Project';
import { OrdinalProjectState } from './states/OrdinalProjectState';
import { PeerReviewProjectState } from './states/PeerReviewProjectState';
import { ManagerReviewProjectState } from './states/ManagerReviewProjectState';
import { FinishedProjectState } from './states/FinishedProjectState';
import { PeerReviewId } from 'project/domain/peer-review/value-objects/PeerReviewId';

export enum PeerReviewVisibilityLabel {
  PUBLIC = 'public',
  PROJECT = 'project',
  MANAGER = 'manager',
  SELF = 'self',
}

enum PeerReviewVisibilityContextUserRole {
  OUTSIDER = 'outsider',
  PEER = 'peer',
  MANAGER = 'manager',
  SENDER = 'sender',
}

export class PeerReviewVisibility extends ValueObject {
  public readonly label: PeerReviewVisibilityLabel;
  private readonly ordinal: number;

  public static readonly SELF = new PeerReviewVisibility(
    PeerReviewVisibilityLabel.SELF,
    1,
  );
  public static readonly MANAGER = new PeerReviewVisibility(
    PeerReviewVisibilityLabel.MANAGER,
    2,
  );
  public static readonly PROJECT = new PeerReviewVisibility(
    PeerReviewVisibilityLabel.PROJECT,
    3,
  );
  public static readonly PUBLIC = new PeerReviewVisibility(
    PeerReviewVisibilityLabel.PUBLIC,
    4,
  );

  public static ofLabel(
    label: PeerReviewVisibilityLabel,
  ): PeerReviewVisibility {
    const lookupTable: Record<
      PeerReviewVisibilityLabel,
      PeerReviewVisibility
    > = {
      [PeerReviewVisibilityLabel.PUBLIC]: PeerReviewVisibility.PUBLIC,
      [PeerReviewVisibilityLabel.PROJECT]: PeerReviewVisibility.PROJECT,
      [PeerReviewVisibilityLabel.MANAGER]: PeerReviewVisibility.MANAGER,
      [PeerReviewVisibilityLabel.SELF]: PeerReviewVisibility.SELF,
    };
    return lookupTable[label];
  }

  /**
   * A peer-review is visible to the user if any of the conditions below are satisfied
   * (logical "and" between columns, logical "or" between rows)
   *
   *  user role       |  visibility   | project state
   * -----------------|---------------|------------------
   *  =sender         | >=self (1)    | >=peer_review (1)
   *  =manager        | >=manager (2) | >=manager_review (2)
   *  =project member | >=project (3) | >=finished (3)
   *  =public user    | >=public (4)  | >=finished (3)
   *
   * visibility order: self < manager < project < public
   * project state order: peer_review < manager_review < finished < archived
   */
  public isVisible(
    peerReviewId: PeerReviewId,
    project: ReadonlyProject,
    user: ReadonlyUser,
  ): boolean {
    project.peerReviews.assertContains(peerReviewId);
    const peerReview = project.peerReviews.whereId(peerReviewId);
    if (!project.peerReviewVisibility.equals(this)) {
      throw new Error(
        'peer-review visibility does not belong to specified project',
      );
    }
    if (!(project.state instanceof OrdinalProjectState)) {
      return false;
    }
    const lookupTable: Record<
      PeerReviewVisibilityContextUserRole,
      [PeerReviewVisibility, OrdinalProjectState]
    > = {
      [PeerReviewVisibilityContextUserRole.SENDER]: [
        PeerReviewVisibility.SELF,
        PeerReviewProjectState.INSTANCE,
      ],
      [PeerReviewVisibilityContextUserRole.MANAGER]: [
        PeerReviewVisibility.MANAGER,
        ManagerReviewProjectState.INSTANCE,
      ],
      [PeerReviewVisibilityContextUserRole.PEER]: [
        PeerReviewVisibility.PROJECT,
        FinishedProjectState.INSTANCE,
      ],
      [PeerReviewVisibilityContextUserRole.OUTSIDER]: [
        PeerReviewVisibility.PUBLIC,
        FinishedProjectState.INSTANCE,
      ],
    };
    const userRole = this.computePeerReviewVisibilityContextUserRole(
      peerReview,
      user,
      project,
    );
    const [minimumPeerReviewVisibility, minimumProjectState] = lookupTable[
      userRole
    ];
    if (this.isSmallerThan(minimumPeerReviewVisibility)) {
      return false;
    }
    if (project.state.isSmallerThan(minimumProjectState)) {
      return false;
    }
    return true;
  }

  public isSmallerThan(other: PeerReviewVisibility): boolean {
    return this.ordinal < other.ordinal;
  }

  public toString(): string {
    return this.label;
  }

  private computePeerReviewVisibilityContextUserRole(
    peerReview: ReadonlyPeerReview,
    user: ReadonlyUser,
    project: ReadonlyProject,
  ): PeerReviewVisibilityContextUserRole {
    if (project.roles.isAnyAssignedToUser(user)) {
      const authUserRole = project.roles.whereAssignee(user);
      if (peerReview.isSenderRole(authUserRole)) {
        return PeerReviewVisibilityContextUserRole.SENDER;
      }
    }
    if (project.isCreator(user)) {
      return PeerReviewVisibilityContextUserRole.MANAGER;
    }
    if (project.roles.isAnyAssignedToUser(user)) {
      return PeerReviewVisibilityContextUserRole.PEER;
    }
    return PeerReviewVisibilityContextUserRole.OUTSIDER;
  }

  private constructor(label: PeerReviewVisibilityLabel, ordinal: number) {
    super();
    this.label = label;
    this.ordinal = ordinal;
  }
}
