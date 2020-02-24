import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app/AppModule';
import { Project } from 'project/domain/Project';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project/domain/ProjectRepository';
import { ModelFaker, PrimitiveFaker } from 'test';
import { TOKEN_MANAGER, TokenManager } from 'token/application/TokenManager';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
import { Role } from 'project/domain/Role';
import { UserRepository, USER_REPOSITORY } from 'user/domain/UserRepository';
import { PeerReviewScore } from 'project/domain/value-objects/PeerReviewScore';
import { HasSubmittedPeerReviews } from 'project/domain/value-objects/HasSubmittedPeerReviews';
import { Contribution } from 'project/domain/value-objects/Contribution';
import { Consensuality } from 'project/domain/value-objects/Consensuality';

describe('submit peer review (e2e)', () => {
  let app: INestApplication;
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let session: request.SuperTest<request.Test>;

  let project: Project;
  let role1: Role;
  let role2: Role;
  let role3: Role;
  let role4: Role;
  let peerReviews: Record<string, Record<string, number>>;

  beforeEach(async () => {
    primitiveFaker = new PrimitiveFaker();
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
    project.state = ProjectState.PEER_REVIEW;

    /* prepare roles */
    role1 = modelFaker.role(project.id, user.id);
    role2 = modelFaker.role(project.id);
    role3 = modelFaker.role(project.id);
    role4 = modelFaker.role(project.id);

    role1.hasSubmittedPeerReviews = HasSubmittedPeerReviews.FALSE;
    role2.hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
    role3.hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
    role4.hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;

    project.roles.add(role1, role2, role3, role4);
    await projectRepository.persist(project);

    peerReviews = {
      [role1.id.value]: {
        [role2.id.value]: 0.3,
        [role3.id.value]: 0.2,
        [role4.id.value]: 0.5,
      },
      [role2.id.value]: {
        [role1.id.value]: 0.8,
        [role3.id.value]: 0.1,
        [role4.id.value]: 0.1,
      },
      [role3.id.value]: {
        [role1.id.value]: 0.8,
        [role2.id.value]: 0.1,
        [role4.id.value]: 0.1,
      },
      [role4.id.value]: {
        [role1.id.value]: 0.8,
        [role2.id.value]: 0.1,
        [role3.id.value]: 0.1,
      },
    };

    /* role1 no peer reviews yet */
    for (const senderRole of [role2, role3, role4]) {
      for (const receiverRole of [role1, role2, role3, role4]) {
        if (senderRole.equals(receiverRole)) {
          continue;
        }
        const peerReview = modelFaker.peerReview(
          senderRole.id,
          receiverRole.id,
        );
        peerReview.score = PeerReviewScore.from(
          peerReviews[senderRole.id.value][receiverRole.id.value],
        );
        project.peerReviews.add(peerReview);
      }
    }

    await projectRepository.persist(project);
  });

  afterEach(async () => {
    await app.close();
  });

  test('happy path, final peer review', async () => {
    const response = await session
      .post(`/projects/${project.id.value}/submit-peer-reviews`)
      .send({ peerReviews: peerReviews[role1.id.value] });
    expect(response.status).toBe(200);
    const updatedProject = await projectRepository.findById(project.id);
    const sentPeerReviews = updatedProject.peerReviews.findBySenderRole(
      role1.id,
    );
    expect(sentPeerReviews).toHaveLength(3);
    for (const sentPeerReview of sentPeerReviews) {
      expect(sentPeerReview.score.value).toBe(
        peerReviews[role1.id.value][sentPeerReview.receiverRoleId.value],
      );
    }
    expect(updatedProject.state).toBe(ProjectState.MANAGER_REVIEW);
    expect(updatedProject.consensuality).not.toBeNull();
    expect((updatedProject.consensuality as Consensuality).value).toEqual(
      expect.any(Number),
    );
    for (const updatedRole of updatedProject.roles) {
      expect(updatedRole.contribution).not.toBeNull();
      expect((updatedRole.contribution as Contribution).value).toEqual(
        expect.any(Number),
      );
    }
  });

  test('happy path, not final peer review', async () => {
    role4.hasSubmittedPeerReviews = HasSubmittedPeerReviews.FALSE;
    await projectRepository.persist(project);
    const response = await session
      .post(`/projects/${project.id.value}/submit-peer-reviews`)
      .send({ peerReviews: peerReviews[role1.id.value] });
    expect(response.status).toBe(200);
    const updatedProject = await projectRepository.findById(project.id);
    const sentPeerReviews = updatedProject.peerReviews.findBySenderRole(
      role1.id,
    );
    expect(sentPeerReviews).toHaveLength(3);
    for (const sentPeerReview of sentPeerReviews) {
      expect(sentPeerReview.score.value).toBe(
        peerReviews[role1.id.value][sentPeerReview.receiverRoleId.value],
      );
    }
    expect(updatedProject.state).toBe(ProjectState.PEER_REVIEW);
    for (const updatedRole of updatedProject.roles) {
      expect(updatedRole.contribution).toBeFalsy();
    }
  });

  test('should fail if project is not in peer-review state', async () => {
    project.state = ProjectState.FORMATION;
    await projectRepository.persist(project);

    const response = await session
      .post(`/projects/${project.id.value}/submit-peer-reviews`)
      .send({ peerReviews: peerReviews[role1.id.value] });
    expect(response.status).toBe(400);
  });

  test('should fail if peer-review already submitted', async () => {
    role1.hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
    await projectRepository.persist(project);

    const response = await session
      .post(`/projects/${project.id.value}/submit-peer-reviews`)
      .send({ peerReviews: peerReviews[role1.id.value] });
    expect(response.status).toBe(400);
  });

  test('should fail if a peer review is for non-existing peer', async () => {
    peerReviews[role1.id.value][primitiveFaker.id()] =
      peerReviews[role1.id.value][role2.id.value];
    delete peerReviews[role1.id.value][role2.id.value];

    const response = await session
      .post(`/projects/${project.id.value}/submit-peer-reviews`)
      .send({ peerReviews: peerReviews[role1.id.value] });
    expect(response.status).toBe(400);
  });
});
