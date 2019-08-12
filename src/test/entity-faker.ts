import { BaseEntity, Project, User } from '../common';

import { primitiveFaker } from './primitive-faker';


class EntityFaker {
  /**
   * Create fake user
   */
  public user(): User {
    const user = this.withBase(new User());
    user.email = primitiveFaker.email();
    user.firstName = primitiveFaker.word();
    user.lastName = primitiveFaker.word();
    user.lastLoginAt = primitiveFaker.timestampUnix();
    return user;
  }

  /**
   * Create fake project
   */
  public project(ownerId: string): Project {
    const project = this.withBase(new Project());
    project.title = primitiveFaker.words();
    project.description = primitiveFaker.paragraph();
    project.ownerId = ownerId;
    return project;
  }

  private withBase<T extends BaseEntity>(entity: T): T {
    entity.id = primitiveFaker.id();
    entity.updatedAt = primitiveFaker.timestampUnix();
    entity.createdAt = primitiveFaker.timestampUnix();
    return entity;
  }
}

export const entityFaker = new EntityFaker();
