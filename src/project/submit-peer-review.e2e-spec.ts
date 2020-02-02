import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app.module';
import { ProjectModel } from 'project/domain/ProjectModel';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project/domain/ProjectRepository';
import {
  RoleModel,
  PeerReviewRepository,
  RoleRepository,
  PEER_REVIEW_REPOSITORY,
  ROLE_REPOSITORY,
} from 'role';
import { EntityFaker, PrimitiveFaker, TestUtils } from 'test';
import { ProjectState } from 'project/domain/ProjectModel';
import { TOKEN_SERVICE, TokenService } from 'token';
import { UserRepository, USER_REPOSITORY } from 'user';

jest.setTimeout(10000);

describe('submit peer review (e2e)', () => {
  let app: INestApplication;
  let entityFaker: EntityFaker;
  let primitiveFaker: PrimitiveFaker;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let peerReviewRepository: PeerReviewRepository;
  let session: request.SuperTest<request.Test>;

  let project: ProjectModel;
  let role1: RoleModel;
  let role2: RoleModel;
  let role3: RoleModel;
  let role4: RoleModel;
  let peerReviews: Record<string, Record<string, number>>;

  beforeEach(async () => {
    primitiveFaker = new PrimitiveFaker();
    entityFaker = new EntityFaker();

    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userRepository = module.get(USER_REPOSITORY);
    projectRepository = module.get(PROJECT_REPOSITORY);
    roleRepository = module.get(ROLE_REPOSITORY);
    peerReviewRepository = module.get(PEER_REVIEW_REPOSITORY);

    app = module.createNestApplication();
    await app.init();

    const user = entityFaker.user();
    await userRepository.persist(user);
    session = request.agent(app.getHttpServer());
    const tokenService = module.get<TokenService>(TOKEN_SERVICE);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);

    /* prepare project */
    project = entityFaker.project(user.id);
    project.state = ProjectState.PEER_REVIEW;
    await projectRepository.persist(project);

    /* prepare roles */
    role1 = entityFaker.role(project.id, user.id);
    role2 = entityFaker.role(project.id);
    role3 = entityFaker.role(project.id);
    role4 = entityFaker.role(project.id);

    role1.hasSubmittedPeerReviews = false;
    role2.hasSubmittedPeerReviews = true;
    role3.hasSubmittedPeerReviews = true;
    role4.hasSubmittedPeerReviews = true;

    await roleRepository.persist(role1, role2, role3, role4);

    peerReviews = {
      [role1.id]: {
        [role2.id]: 0.3,
        [role3.id]: 0.2,
        [role4.id]: 0.5,
      },
      [role2.id]: {
        [role1.id]: 0.8,
        [role3.id]: 0.1,
        [role4.id]: 0.1,
      },
      [role3.id]: {
        [role1.id]: 0.8,
        [role2.id]: 0.1,
        [role4.id]: 0.1,
      },
      [role4.id]: {
        [role1.id]: 0.8,
        [role2.id]: 0.1,
        [role3.id]: 0.1,
      },
    };

    /* role1 no peer reviews yet */
    for (const senderRole of [role2, role3, role4]) {
      for (const receiverRole of [role1, role2, role3, role4]) {
        if (senderRole === receiverRole) {
          continue;
        }
        const peerReview = entityFaker.peerReview(
          senderRole.id,
          receiverRole.id,
        );
        peerReview.score = peerReviews[senderRole.id][receiverRole.id];
        await peerReviewRepository.persist(peerReview);
      }
    }
  });

  afterEach(async () => {
    await app.close();
  });

  test('happy path, final peer review', async () => {
    const response = await session
      .post(`/projects/${project.id}/submit-peer-reviews`)
      .send({ peerReviews: peerReviews[role1.id] });
    expect(response.status).toBe(200);
    await TestUtils.sleep(500);
    const sentPeerReviews = await peerReviewRepository.findBySenderRoleId(
      role1.id,
    );
    expect(sentPeerReviews).toHaveLength(3);
    for (const sentPeerReview of sentPeerReviews) {
      expect(sentPeerReview.score).toBe(
        peerReviews[role1.id][sentPeerReview.receiverRoleId],
      );
    }
    const updatedProject = await projectRepository.findById(project.id);
    expect(updatedProject.state).toBe(ProjectState.MANAGER_REVIEW);
    expect(updatedProject.consensuality).toEqual(expect.any(Number));
    const updatedRoles = await roleRepository.findByProjectId(project.id);
    for (const updatedRole of updatedRoles) {
      expect(updatedRole.contribution).toEqual(expect.any(Number));
    }
  });

  test('happy path, not final peer review', async () => {
    role4.hasSubmittedPeerReviews = false;
    await roleRepository.persist(role4);
    const response = await session
      .post(`/projects/${project.id}/submit-peer-reviews`)
      .send({ peerReviews: peerReviews[role1.id] });
    expect(response.status).toBe(200);
    await TestUtils.sleep(500);
    const sentPeerReviews = await peerReviewRepository.findBySenderRoleId(
      role1.id,
    );
    expect(sentPeerReviews).toHaveLength(3);
    for (const sentPeerReview of sentPeerReviews) {
      expect(sentPeerReview.score).toBe(
        peerReviews[role1.id][sentPeerReview.receiverRoleId],
      );
    }
    const updatedProject = await projectRepository.findById(project.id);
    expect(updatedProject.state).toBe(ProjectState.PEER_REVIEW);
    const updatedRoles = await roleRepository.findByProjectId(project.id);
    for (const updatedRole of updatedRoles) {
      expect(updatedRole.contribution).toBeFalsy();
    }
  });

  test('should fail if project is not in peer-review state', async () => {
    project.state = ProjectState.FORMATION;
    await projectRepository.persist(project);

    const response = await session
      .post(`/projects/${project.id}/submit-peer-reviews`)
      .send({ peerReviews: peerReviews[role1.id] });
    expect(response.status).toBe(400);
  });

  test('should fail if peer-review already submitted', async () => {
    role1.hasSubmittedPeerReviews = true;
    await roleRepository.persist(role1);

    const response = await session
      .post(`/projects/${project.id}/submit-peer-reviews`)
      .send({ peerReviews: peerReviews[role1.id] });
    expect(response.status).toBe(400);
  });

  test('should fail if a peer review is for non-existing peer', async () => {
    peerReviews[role1.id][primitiveFaker.id()] =
      peerReviews[role1.id][role2.id];
    delete peerReviews[role1.id][role2.id];

    const response = await session
      .post(`/projects/${project.id}/submit-peer-reviews`)
      .send({ peerReviews: peerReviews[role1.id] });
    expect(response.status).toBe(400);
  });
});
