import { PrimitiveFaker } from 'test/fakers/primitive-faker';
import {
  Project,
  ProjectState,
  ContributionVisibility,
  SkipManagerReview,
} from 'project';
import { User } from 'user';
import { Role, PeerReview } from 'role';

export class ObjectFaker {
  private readonly primitiveFaker: PrimitiveFaker;

  public constructor(primitiveFaker: PrimitiveFaker = new PrimitiveFaker()) {
    this.primitiveFaker = primitiveFaker;
  }

  /**
   * Create fake user
   */
  public user(): User {
    return {
      id: this.primitiveFaker.id(),
      email: this.primitiveFaker.email(),
      firstName: this.primitiveFaker.word(),
      lastName: this.primitiveFaker.word(),
      lastLoginAt: this.primitiveFaker.timestampUnix(),
    };
  }

  /**
   * Create fake project
   */
  public project(ownerId: string): Project {
    return {
      id: this.primitiveFaker.id(),
      ownerId,
      title: this.primitiveFaker.words(),
      description: this.primitiveFaker.paragraph(),
      state: ProjectState.FORMATION,
      consensuality: null,
      contributionVisibility: ContributionVisibility.SELF,
      skipManagerReview: SkipManagerReview.NO,
    };
  }

  /**
   * Create a fake role
   */
  public role(projectId: string, assigneeId: string | null = null): Role {
    return {
      id: this.primitiveFaker.id(),
      projectId,
      assigneeId,
      title: this.primitiveFaker.words(),
      description: this.primitiveFaker.paragraph(),
      contribution: null,
      hasSubmittedPeerReviews: false,
    };
  }

  /**
   * Create a fake peer review
   */
  public peerReview(senderRoleId: string, receiverRoleId: string): PeerReview {
    return {
      id: this.primitiveFaker.id(),
      senderRoleId,
      receiverRoleId,
      score: this.primitiveFaker.number(),
    };
  }
}
