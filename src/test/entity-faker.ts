import { UserEntity } from 'user/entities/user.entity';
import {
  ProjectEntity,
  ProjectState,
  ContributionVisibility,
  SkipManagerReview,
} from 'project/entities/project.entity';
import { RoleEntity } from 'role/entities/role.entity';
import { PeerReviewEntity } from 'role/entities/peer-review.entity';

import { primitiveFaker } from 'test/primitive-faker';

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
      skipManagerReview: SkipManagerReview.NO,
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
    });
  }

  /**
   * Create a fake peer review
   */
  public peerReview(
    reviewerRoleId: string,
    revieweeRoleId: string,
  ): PeerReviewEntity {
    return PeerReviewEntity.from({
      id: primitiveFaker.id(),
      reviewerRoleId,
      revieweeRoleId,
      score: primitiveFaker.number(),
    });
  }
}

export const entityFaker = new EntityFaker();
