import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { ReadonlyPeerReview } from 'project/domain/peer-review/PeerReview';
import { ReadonlyUser } from 'user/domain/User';
import { ReadonlyProject } from '../Project';
import { OrdinalProjectState } from './states/OrdinalProjectState';
import { PeerReviewProjectState } from './states/PeerReviewProjectState';
import { ManagerReviewProjectState } from './states/ManagerReviewProjectState';
import { FinishedProjectState } from './states/FinishedProjectState';

export enum PeerReviewVisibilityLabel {
  PUBLIC = 'public',
  PROJECT = 'project',
  MANAGER = 'manager',
  SELF = 'self',
}

enum PeerReviewVisibilityContextUserRole {
  PUBLIC_USER,
  PROJECT_MEMBER,
  MANAGER,
  SENDER,
}

export class PeerReviewVisibility extends ValueObject {
  public readonly label: PeerReviewVisibilityLabel;
  private readonly ordinal: number;

  public static readonly PUBLIC = new PeerReviewVisibility(
    PeerReviewVisibilityLabel.PUBLIC,
    1,
  );
  public static readonly PROJECT = new PeerReviewVisibility(
    PeerReviewVisibilityLabel.PROJECT,
    2,
  );
  public static readonly MANAGER = new PeerReviewVisibility(
    PeerReviewVisibilityLabel.MANAGER,
    3,
  );
  public static readonly SELF = new PeerReviewVisibility(
    PeerReviewVisibilityLabel.SELF,
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
   *  user role       | visibility | project state
   * -----------------|------------|------------------
   *  =sender         |  >=self    | >=peer_review
   *  =manager        |  >=manager | >=manager_review
   *  =project member |  >=project | >=finished
   *  =public user    |  >=public  | >=finished
   */
  public isVisible(
    peerReview: ReadonlyPeerReview,
    project: ReadonlyProject,
    user: ReadonlyUser,
  ): boolean {
    if (project.peerReviewVisibility !== this) {
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
      [PeerReviewVisibilityContextUserRole.PROJECT_MEMBER]: [
        PeerReviewVisibility.PROJECT,
        FinishedProjectState.INSTANCE,
      ],
      [PeerReviewVisibilityContextUserRole.PUBLIC_USER]: [
        PeerReviewVisibility.PUBLIC,
        FinishedProjectState.INSTANCE,
      ],
    };
    const [minimumPeerReviewVisibility, minimumProjectState] = lookupTable[
      this.computePeerReviewVisibilityContextUserRole(peerReview, user, project)
    ];
    if (!this.isGreaterEqualsThan(minimumPeerReviewVisibility)) {
      return false;
    }
    if (!project.state.isGreaterEqualsThan(minimumProjectState)) {
      return false;
    }
    return true;
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
      return PeerReviewVisibilityContextUserRole.PROJECT_MEMBER;
    }
    return PeerReviewVisibilityContextUserRole.PUBLIC_USER;
  }

  private isGreaterEqualsThan(other: PeerReviewVisibility): boolean {
    return this.ordinal >= other.ordinal;
  }

  private constructor(label: PeerReviewVisibilityLabel, ordinal: number) {
    super();
    this.label = label;
    this.ordinal = ordinal;
  }
}
