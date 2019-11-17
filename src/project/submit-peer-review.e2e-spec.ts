import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../app.module';
import {
  ProjectEntity,
  ProjectState,
  ProjectRepository,
  RoleEntity,
  PeerReviewRepository,
  RoleRepository,
  TokenService,
  UserRepository,
} from '../common';
import { entityFaker, primitiveFaker } from '../test';

jest.setTimeout(10000);

describe('submit peer review (e2e)', () => {
  let app: INestApplication;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let peerReviewRepository: PeerReviewRepository;
  let session: request.SuperTest<request.Test>;

  let project: ProjectEntity;
  let role1: RoleEntity;
  let role2: RoleEntity;
  let role3: RoleEntity;
  let role4: RoleEntity;
  let peerReviews: Record<string, Record<string, number>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const userRepository = module.get(UserRepository);
    projectRepository = module.get(ProjectRepository);
    roleRepository = module.get(RoleRepository);
    peerReviewRepository = module.get(PeerReviewRepository);
    const user = await userRepository.save(entityFaker.user());
    app = module.createNestApplication();
    await app.init();
    session = request.agent(app.getHttpServer());
    const tokenService = module.get(TokenService);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);

    /* prepare project */
    project = entityFaker.project(user.id);
    project.state = ProjectState.PEER_REVIEW;

    await projectRepository.save(project);

    /* prepare roles */
    role1 = entityFaker.role(project.id);
    role2 = entityFaker.role(project.id);
    role3 = entityFaker.role(project.id);
    role4 = entityFaker.role(project.id);

    role1.assigneeId = user.id;

    await roleRepository.save(role1);
    await roleRepository.save(role2);
    await roleRepository.save(role3);
    await roleRepository.save(role4);

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
    for (const reviewerRole of [role2, role3, role4]) {
      for (const revieweeRole of [role1, role2, role3, role4]) {
        if (reviewerRole === revieweeRole) {
          continue;
        }
        const peerReview = entityFaker.peerReview(
          reviewerRole,
          revieweeRole.id,
        );
        peerReview.score = peerReviews[reviewerRole.id][revieweeRole.id];
        reviewerRole.peerReviews.push(peerReview);
      }
    }

    await roleRepository.save(role1);
    await roleRepository.save(role2);
    await roleRepository.save(role3);
    await roleRepository.save(role4);
  });

  test('happy path, final peer review', async () => {
    const response = await session
      .post(`/projects/${project.id}/submit-peer-reviews`)
      .send({ peerReviews: peerReviews[role1.id] });
    expect(response.status).toBe(200);
    const updatedRole = await roleRepository.findOneOrFail({ id: role1.id });
    expect(updatedRole.peerReviews).toHaveLength(3);
    for (const peerReview of updatedRole.peerReviews) {
      expect(peerReview.score).toBe(
        peerReviews[role1.id][peerReview.revieweeRoleId],
      );
    }
    const updatedProject = await projectRepository.findOneOrFail({
      id: project.id,
    });
    expect(updatedProject.state).toBe(ProjectState.FINISHED);
    expect(updatedProject.contributions).toEqual(
      expect.objectContaining({
        [role1.id]: expect.any(Number),
        [role2.id]: expect.any(Number),
        [role3.id]: expect.any(Number),
        [role4.id]: expect.any(Number),
      }),
    );
    expect(updatedProject.consensuality).toEqual(expect.any(Number));
  });

  test('happy path, not final peer review', async () => {
    for (const peerReviewToRemove of role2.peerReviews) {
      await peerReviewRepository.remove(peerReviewToRemove);
    }
    role2.peerReviews = [];

    const response = await session
      .post(`/projects/${project.id}/submit-peer-reviews`)
      .send({ peerReviews: peerReviews[role1.id] });
    expect(response.status).toBe(200);
    const updatedRole = await roleRepository.findOneOrFail({ id: role1.id });
    expect(updatedRole.peerReviews).toHaveLength(3);
    for (const peerReview of updatedRole.peerReviews) {
      expect(peerReview.score).toBe(
        peerReviews[role1.id][peerReview.revieweeRoleId],
      );
    }
    const updatedProject = await projectRepository.findOneOrFail({
      id: project.id,
    });
    expect(updatedProject.state).toBe(ProjectState.PEER_REVIEW);
    expect(updatedProject.contributions).toBeFalsy();
  });

  test('should fail if project is not in peer-review state', async () => {
    project.state = ProjectState.FORMATION;
    await projectRepository.save(project);

    const response = await session
      .post(`/projects/${project.id}/submit-peer-reviews`)
      .send({ peerReviews: peerReviews[role1.id] });
    expect(response.status).toBe(400);
  });

  test('should fail if peer-review already submitted', async () => {
    for (const revieweeRole of [role2, role3, role4]) {
      const peerReview = entityFaker.peerReview(role1, revieweeRole.id);
      peerReview.score = peerReviews[role1.id][revieweeRole.id];
      role1.peerReviews.push(peerReview);
    }
    await roleRepository.save(role1);

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
