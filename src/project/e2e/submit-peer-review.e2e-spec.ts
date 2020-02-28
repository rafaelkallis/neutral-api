import { Project } from 'project/domain/Project';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
import { Role } from 'project/domain/Role';
import { PeerReviewScore } from 'project/domain/value-objects/PeerReviewScore';
import { HasSubmittedPeerReviews } from 'project/domain/value-objects/HasSubmittedPeerReviews';
import { Contribution } from 'project/domain/value-objects/Contribution';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { TestScenario } from 'test/TestScenario';
import { User } from 'user/domain/User';

describe('submit peer review (e2e)', () => {
  let scenario: TestScenario;

  let user: User;
  let project: Project;
  let role1: Role;
  let role2: Role;
  let role3: Role;
  let role4: Role;
  let peerReviews: Record<string, Record<string, number>>;

  beforeEach(async () => {
    scenario = await TestScenario.create();

    user = await scenario.createUser();
    await scenario.authenticateUser(user);

    /* prepare project */
    project = scenario.modelFaker.project(user.id);
    project.state = ProjectState.PEER_REVIEW;

    /* prepare roles */
    role1 = scenario.modelFaker.role(project.id, user.id);
    role2 = scenario.modelFaker.role(project.id);
    role3 = scenario.modelFaker.role(project.id);
    role4 = scenario.modelFaker.role(project.id);

    role1.hasSubmittedPeerReviews = HasSubmittedPeerReviews.FALSE;
    role2.hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
    role3.hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
    role4.hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;

    project.roles.add(role1, role2, role3, role4);
    await scenario.projectRepository.persist(project);

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
        const peerReview = scenario.modelFaker.peerReview(
          senderRole.id,
          receiverRole.id,
        );
        peerReview.score = PeerReviewScore.from(
          peerReviews[senderRole.id.value][receiverRole.id.value],
        );
        project.peerReviews.add(peerReview);
      }
    }

    await scenario.projectRepository.persist(project);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('happy path, final peer review', async () => {
    const response = await scenario.session
      .post(`/projects/${project.id.value}/submit-peer-reviews`)
      .send({ peerReviews: peerReviews[role1.id.value] });
    expect(response.status).toBe(200);
    const updatedProject = await scenario.projectRepository.findById(
      project.id,
    );
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
    await scenario.projectRepository.persist(project);
    const response = await scenario.session
      .post(`/projects/${project.id.value}/submit-peer-reviews`)
      .send({ peerReviews: peerReviews[role1.id.value] });
    expect(response.status).toBe(200);
    const updatedProject = await scenario.projectRepository.findById(
      project.id,
    );
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
    await scenario.projectRepository.persist(project);

    const response = await scenario.session
      .post(`/projects/${project.id.value}/submit-peer-reviews`)
      .send({ peerReviews: peerReviews[role1.id.value] });
    expect(response.status).toBe(400);
  });

  test('should fail if peer-review already submitted', async () => {
    role1.hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
    await scenario.projectRepository.persist(project);

    const response = await scenario.session
      .post(`/projects/${project.id.value}/submit-peer-reviews`)
      .send({ peerReviews: peerReviews[role1.id.value] });
    expect(response.status).toBe(400);
  });

  test('should fail if a peer review is for non-existing peer', async () => {
    peerReviews[role1.id.value][scenario.primitiveFaker.id()] =
      peerReviews[role1.id.value][role2.id.value];
    delete peerReviews[role1.id.value][role2.id.value];

    const response = await scenario.session
      .post(`/projects/${project.id.value}/submit-peer-reviews`)
      .send({ peerReviews: peerReviews[role1.id.value] });
    expect(response.status).toBe(400);
  });
});
