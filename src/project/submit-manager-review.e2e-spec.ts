import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app.module';
import { TokenService } from 'common';
import { ProjectEntity } from 'project/entities/project.entity';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project/repositories/project.repository';
import { EntityFaker } from 'test';
import { TestModule } from 'test/test.module';
import { ProjectState } from 'project/project';

describe('submit manager review (e2e)', () => {
  let entityFaker: EntityFaker;
  let projectRepository: ProjectRepository;
  let session: request.SuperTest<request.Test>;
  let project: ProjectEntity;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();
    entityFaker = module.get(EntityFaker);
    projectRepository = module.get(PROJECT_REPOSITORY);
    const user = entityFaker.user();
    await user.persist();
    const app = module.createNestApplication();
    await app.init();
    session = request.agent(app.getHttpServer());
    const tokenService = module.get(TokenService);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);

    /* prepare project */
    project = entityFaker.project(user.id);
    project.state = ProjectState.MANAGER_REVIEW;
    await project.persist();
  });

  test('happy path', async () => {
    const response = await session.post(
      `/projects/${project.id}/submit-manager-review`,
    );
    expect(response.status).toBe(200);
    const updatedProject = await projectRepository.findOne(project.id);
    expect(updatedProject.state).toBe(ProjectState.FINISHED);
  });

  test('should fail if project is not in manager-review state', async () => {
    project.state = ProjectState.FORMATION;
    await project.persist();

    const response = await session.post(
      `/projects/${project.id}/submit-manager-review`,
    );
    expect(response.status).toBe(400);
  });

  test('should fail if authenticated user is not the project owner', async () => {
    const otherUser = entityFaker.user();
    await otherUser.persist();
    project.ownerId = otherUser.id;
    await project.persist();

    const response = await session.post(
      `/projects/${project.id}/submit-manager-review`,
    );
    expect(response.status).toBe(403);
  });
});
