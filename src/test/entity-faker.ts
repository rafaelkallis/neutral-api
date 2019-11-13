import { RoleEntity, ProjectEntity, ProjectState, UserEntity } from '../common';

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
      contributions: null,
      consensuality: null,
    });
  }

  /**
   * Create a fake role
   */
  public role(projectId: string, assigneeId: string | null = null): RoleEntity {
    const id = primitiveFaker.id();
    return RoleEntity.from({
      id,
      projectId,
      assigneeId,
      title: primitiveFaker.words(),
      description: primitiveFaker.paragraph(),
      peerReviews: {
        [id]: 0,
        [primitiveFaker.id()]: 0.3,
        [primitiveFaker.id()]: 0.2,
        [primitiveFaker.id()]: 0.5,
      },
    });
  }
}

export const entityFaker = new EntityFaker();
