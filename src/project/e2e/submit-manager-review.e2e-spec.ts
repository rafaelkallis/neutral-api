import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app/AppModule';
import { Project } from 'project/domain/Project';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project/domain/ProjectRepository';
import { ModelFaker } from 'test';
import { TOKEN_MANAGER, TokenManager } from 'token/application/TokenManager';
import { UserRepository, USER_REPOSITORY } from 'user/domain/UserRepository';
import { ProjectState } from 'project/domain/value-objects/ProjectState';

describe('submit manager review (e2e)', () => {
  let app: INestApplication;
  let modelFaker: ModelFaker;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let session: request.SuperTest<request.Test>;
  let project: Project;

  beforeEach(async () => {
    modelFaker = new ModelFaker();
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userRepository = module.get(USER_REPOSITORY);
    projectRepository = module.get(PROJECT_REPOSITORY);
    app = module.createNestApplication();
    await app.init();
    const user = modelFaker.user();
    await userRepository.persist(user);
    session = request.agent(app.getHttpServer());
    const tokenService = module.get<TokenManager>(TOKEN_MANAGER);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);

    /* prepare project */
    project = modelFaker.project(user.id);
    project.state = ProjectState.MANAGER_REVIEW;
    await projectRepository.persist(project);
  });

  afterEach(async () => {
    await app.close();
  });

  test('happy path', async () => {
    const response = await session.post(
      `/projects/${project.id}/submit-manager-review`,
    );
    expect(response.status).toBe(200);
    const updatedProject = await projectRepository.findById(project.id);
    expect(updatedProject.state).toBe(ProjectState.FINISHED);
  });

  test('should fail if project is not in manager-review state', async () => {
    project.state = ProjectState.FORMATION;
    await projectRepository.persist(project);

    const response = await session.post(
      `/projects/${project.id}/submit-manager-review`,
    );
    expect(response.status).toBe(400);
  });

  test('should fail if authenticated user is not the project owner', async () => {
    const otherUser = modelFaker.user();
    await userRepository.persist(otherUser);
    project.creatorId = otherUser.id;
    await projectRepository.persist(project);

    const response = await session.post(
      `/projects/${project.id}/submit-manager-review`,
    );
    expect(response.status).toBe(403);
  });
});