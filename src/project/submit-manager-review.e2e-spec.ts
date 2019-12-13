import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app.module';
import { TokenService } from 'common';
import { UserRepository } from 'user';
import { ProjectEntity, ProjectState } from 'project/entities/project.entity';
import { ProjectRepository } from 'project/repositories/project.repository';
import { entityFaker } from 'test';

describe('submit manager review (e2e)', () => {
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let session: request.SuperTest<request.Test>;
  let project: ProjectEntity;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userRepository = module.get(UserRepository);
    projectRepository = module.get(ProjectRepository);
    const user = entityFaker.user();
    await userRepository.insert(user);
    const app = module.createNestApplication();
    await app.init();
    session = request.agent(app.getHttpServer());
    const tokenService = module.get(TokenService);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);

    /* prepare project */
    project = entityFaker.project(user.id);
    project.state = ProjectState.MANAGER_REVIEW;
    await projectRepository.insert(project);
  });

  test('happy path', async () => {
    const response = await session.post(
      `/projects/${project.id}/submit-manager-review`,
    );
    expect(response.status).toBe(200);
    const updatedProject = await projectRepository.findOne({
      id: project.id,
    });
    expect(updatedProject.state).toBe(ProjectState.FINISHED);
  });

  test('should fail if project is not in manager-review state', async () => {
    project.state = ProjectState.FORMATION;
    await projectRepository.update(project);

    const response = await session.post(
      `/projects/${project.id}/submit-manager-review`,
    );
    expect(response.status).toBe(400);
  });

  test('should fail if authenticated user is not the project owner', async () => {
    const otherUser = entityFaker.user();
    await userRepository.insert(otherUser);
    project.ownerId = otherUser.id;
    await projectRepository.update(project);

    const response = await session.post(
      `/projects/${project.id}/submit-manager-review`,
    );
    expect(response.status).toBe(403);
  });
});
