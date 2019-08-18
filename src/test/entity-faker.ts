import { Role, Project, ProjectState, User } from '../common';

import { primitiveFaker } from './primitive-faker';

class EntityFaker {
  /**
   * Create fake user
   */
  public user(): User {
    return User.from({
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
  public project(ownerId: string): Project {
    return Project.from({
      id: primitiveFaker.id(),
      ownerId,
      title: primitiveFaker.words(),
      description: primitiveFaker.paragraph(),
      state: ProjectState.FORMATION,
    });
  }

  /**
   * Create a fake role
   */
  public role(projectId: string, assigneeId?: string): Role {
    return Role.from({
      id: primitiveFaker.id(),
      projectId,
      assigneeId,
      title: primitiveFaker.words(),
      description: primitiveFaker.paragraph(),
      peerReviews: {
        [primitiveFaker.id()]: 0.3,
        [primitiveFaker.id()]: 0.2,
        [primitiveFaker.id()]: 0.5,
      },
    });
  }
}

export const entityFaker = new EntityFaker();
