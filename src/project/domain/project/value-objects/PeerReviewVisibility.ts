import { ReadonlyPeerReview } from 'project/domain/peer-review/PeerReview';
import { ReadonlyUser } from 'user/domain/User';
import { ReadonlyProject } from '../Project';
import { PeerReviewId } from 'project/domain/peer-review/value-objects/PeerReviewId';
import { Comprarable } from 'shared/domain/value-objects/Comparable';
import { MilestoneState } from 'project/domain/milestone/value-objects/states/MilestoneState';
import { ManagerReviewMilestoneState } from 'project/domain/milestone/value-objects/states/ManagerReviewMilestoneState';
import { FinishedMilestoneState } from 'project/domain/milestone/value-objects/states/FinishedMilestoneState';
import { CancelledMilestoneState } from 'project/domain/milestone/value-objects/states/CancelledMilestoneState';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

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

export class PeerReviewVisibility
  extends ValueObject
  implements Comprarable<PeerReviewVisibility> {
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
   *  user role       |  visibility   | milestone state
   * -----------------|---------------|------------------
   *  =sender         | >=self (1)    | >=peer_review (1)
   *  =manager        | >=manager (2) | >=manager_review (2)
   *  =project member | >=project (3) | >=finished (3)
   *  =public user    | >=public (4)  | >=finished (3)
   *
   * visibility order: self < manager < project < public
   * milestone state order: cancelled < peer_review < manager_review < finished
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
    const lookupTable: Record<
      PeerReviewVisibilityContextUserRole,
      [PeerReviewVisibility, MilestoneState]
    > = {
      [PeerReviewVisibilityContextUserRole.SENDER]: [
        PeerReviewVisibility.SELF,
        CancelledMilestoneState.INSTANCE,
      ],
      [PeerReviewVisibilityContextUserRole.MANAGER]: [
        PeerReviewVisibility.MANAGER,
        ManagerReviewMilestoneState.INSTANCE,
      ],
      [PeerReviewVisibilityContextUserRole.PEER]: [
        PeerReviewVisibility.PROJECT,
        FinishedMilestoneState.INSTANCE,
      ],
      [PeerReviewVisibilityContextUserRole.OUTSIDER]: [
        PeerReviewVisibility.PUBLIC,
        FinishedMilestoneState.INSTANCE,
      ],
    };
    const userRole = this.computePeerReviewVisibilityContextUserRole(
      peerReview,
      user,
    );
    const [minimumPeerReviewVisibility, minimumMilestoneState] = lookupTable[
      userRole
    ];
    if (this.compareTo(minimumPeerReviewVisibility) < 0) {
      return false;
    }
    if (peerReview.milestone.state.compareTo(minimumMilestoneState) < 0) {
      return false;
    }
    return true;
  }

  public toString(): string {
    return this.label;
  }

  private computePeerReviewVisibilityContextUserRole(
    peerReview: ReadonlyPeerReview,
    user: ReadonlyUser,
  ): PeerReviewVisibilityContextUserRole {
    if (peerReview.project.roles.isAnyAssignedToUser(user)) {
      const authUserRole = peerReview.project.roles.whereAssignee(user);
      if (peerReview.isSenderRole(authUserRole)) {
        return PeerReviewVisibilityContextUserRole.SENDER;
      }
    }
    if (peerReview.project.isCreator(user)) {
      return PeerReviewVisibilityContextUserRole.MANAGER;
    }
    if (peerReview.project.roles.isAnyAssignedToUser(user)) {
      return PeerReviewVisibilityContextUserRole.PEER;
    }
    return PeerReviewVisibilityContextUserRole.OUTSIDER;
  }

  private constructor(label: PeerReviewVisibilityLabel, ordinal: number) {
    super();
    this.label = label;
    this.ordinal = ordinal;
  }

  public compareTo(other: PeerReviewVisibility): number {
    return this.ordinal - other.ordinal;
  }
}
