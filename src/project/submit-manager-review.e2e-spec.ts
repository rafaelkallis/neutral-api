import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app.module';
import { ProjectEntity } from 'project/entities/project.entity';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project/repositories/project.repository';
import { EntityFaker } from 'test';
import { ProjectState } from 'project/project';
import { TOKEN_SERVICE, TokenService } from 'token';
import { UserRepository, USER_REPOSITORY } from 'user';

describe('submit manager review (e2e)', () => {
  let entityFaker: EntityFaker;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let session: request.SuperTest<request.Test>;
  let project: ProjectEntity;

  beforeEach(async () => {
    entityFaker = new EntityFaker();
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userRepository = module.get(USER_REPOSITORY);
    projectRepository = module.get(PROJECT_REPOSITORY);
    const app = module.createNestApplication();
    await app.init();
    const user = entityFaker.user();
    await userRepository.persist(user);
    session = request.agent(app.getHttpServer());
    const tokenService = module.get<TokenService>(TOKEN_SERVICE);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);

    /* prepare project */
    project = entityFaker.project(user.id);
    project.state = ProjectState.MANAGER_REVIEW;
    await projectRepository.persist(project);
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
    await projectRepository.persist(project);

    const response = await session.post(
      `/projects/${project.id}/submit-manager-review`,
    );
    expect(response.status).toBe(400);
  });

  test('should fail if authenticated user is not the project owner', async () => {
    const otherUser = entityFaker.user();
    await userRepository.persist(otherUser);
    project.ownerId = otherUser.id;
    await projectRepository.persist(project);

    const response = await session.post(
      `/projects/${project.id}/submit-manager-review`,
    );
    expect(response.status).toBe(403);
  });
});