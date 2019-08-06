import { primitiveFaker } from './primitive-faker';
import { BaseEntity, User, Project } from '../common';

export const entityFaker = {
  user(): User {
    const user = withBase(new User());
    user.email = primitiveFaker.email();
    user.firstName = primitiveFaker.word();
    user.lastName = primitiveFaker.word();
    user.lastLoginAt = primitiveFaker.timestampUnix();
    return user;
  },

  project(ownerId: string): Project {
    const project = withBase(new Project());
    project.title = primitiveFaker.words();
    project.description = primitiveFaker.paragraph();
    project.ownerId = ownerId;
    return project;
  },
};

function withBase<T extends BaseEntity>(entity: T): T {
  entity.id = primitiveFaker.id();
  entity.updatedAt = primitiveFaker.timestampUnix();
  entity.createdAt = primitiveFaker.timestampUnix();
  return entity;
}
