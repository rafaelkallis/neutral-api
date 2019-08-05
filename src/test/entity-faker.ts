import * as faker from 'faker';
import { BaseEntity, User, Project } from '../common';

export const entityFaker = {
  newUser(): User {
    const user = withBase(new User());
    user.email = faker.internet.email();
    user.firstName = faker.name.firstName();
    user.lastName = faker.name.lastName();
    user.lastLoginAt = Math.floor(faker.date.recent().getTime() / 1000);
    return user;
  },

  newProject(ownerId: string): Project {
    const project = withBase(new Project());
    project.title = faker.lorem.words();
    project.description = faker.lorem.paragraph();
    project.ownerId = ownerId;
    return project;
  },
};

let idCounter = 0;
function withBase<T extends BaseEntity>(entity: T): T {
  entity.id = String(idCounter++);
  entity.updatedAt = Math.floor(faker.date.past().getTime() / 1000);
  while (entity.updatedAt < entity.createdAt) {
    entity.createdAt = Math.floor(faker.date.past().getTime() / 1000);
  }
  return entity;
}
