import { UserEntity } from '../user';
import {
  ProjectEntity,
  ProjectState,
  ContributionVisibility,
  SkipManagerReview,
} from '../project';
import { RoleEntity, PeerReviewEntity } from '../role';

import { primitiveFaker } from './primitive-faker';

class EntityFaker {
  /**
   * Create fake user
   */
  public user(): UserEntity {
    return UserEntity.from({
      id: primitiveFaker.id(),
      email: primitiveFaker.email(),
      firstName: primitiveFaker.word(),
      lastName: primitiveFaker.word(),
      lastLoginAt: primitiveFaker.timestampUnix(),
    });
  }

  /**
   * Create fake project
   */
  public project(ownerId: string): ProjectEntity {
    return ProjectEntity.from({
      id: primitiveFaker.id(),
      ownerId,
      title: primitiveFaker.words(),
      description: primitiveFaker.paragraph(),
      state: ProjectState.FORMATION,
      consensuality: null,
      contributionVisibility: ContributionVisibility.SELF,
      skipManagerReview: SkipManagerReview.IF_CONSENSUAL,
    });
  }

  /**
   * Create a fake role
   */
  public role(projectId: string, assigneeId: string | null = null): RoleEntity {
    return RoleEntity.from({
      id: primitiveFaker.id(),
      projectId,
      assigneeId,
      title: primitiveFaker.words(),
      description: primitiveFaker.paragraph(),
      contribution: null,
      peerReviews: [],
    });
  }

  /**
   * Create a fake peer review
   */
  public peerReview(
    reviewerRole: RoleEntity,
    revieweeRoleId: string,
  ): PeerReviewEntity {
    return PeerReviewEntity.from({
      id: primitiveFaker.id(),
      reviewerRole: reviewerRole,
      revieweeRoleId,
      score: primitiveFaker.number(),
    });
  }
}

export const entityFaker = new EntityFaker();
