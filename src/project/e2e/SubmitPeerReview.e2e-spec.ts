import { Project } from 'project/domain/project/Project';
import { Role } from 'project/domain/role/Role';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { HasSubmittedPeerReviews } from 'project/domain/role/value-objects/HasSubmittedPeerReviews';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { User } from 'user/domain/User';
import { PeerReviewProjectState } from 'project/domain/project/value-objects/states/PeerReviewProjectState';
import { ManagerReviewProjectState } from 'project/domain/project/value-objects/states/ManagerReviewProjectState';
import { FormationProjectState } from 'project/domain/project/value-objects/states/FormationProjectState';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';

describe('submit peer review (e2e)', () => {
  let scenario: IntegrationTestScenario;

  let user: User;
  let project: Project;
  let role1: Role;
  let role2: Role;
  let role3: Role;
  let role4: Role;
  let reviewTopic: ReviewTopic;
  let peerReviews: Record<string, Record<string, number>>;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();

    user = await scenario.createUser();
    await scenario.authenticateUser(user);

    /* prepare project */
    project = scenario.modelFaker.project(user.id);
    project.state = PeerReviewProjectState.INSTANCE;

    /* prepare roles */
    role1 = scenario.modelFaker.role(user.id);
    role2 = scenario.modelFaker.role();
    role3 = scenario.modelFaker.role();
    role4 = scenario.modelFaker.role();

    role1.hasSubmittedPeerReviews = HasSubmittedPeerReviews.FALSE;
    role2.hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
    role3.hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
    role4.hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;

    project.roles.addAll([role1, role2, role3, role4]);
    await scenario.projectRepository.persist(project);

    /* add review topic */
    reviewTopic = scenario.modelFaker.reviewTopic();
    project.reviewTopics.add(reviewTopic);
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
          reviewTopic.id,
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
    if (!updatedProject) {
      throw new Error();
    }
    const submittedPeerReviews = Array.from(
      updatedProject.peerReviews.findBySenderRole(role1.id),
    );
    expect(submittedPeerReviews).toHaveLength(3);
    for (const submittedPeerReview of submittedPeerReviews) {
      expect(submittedPeerReview.score.value).toBe(
        peerReviews[role1.id.value][submittedPeerReview.receiverRoleId.value],
      );
    }
    expect(updatedProject.state).toBe(ManagerReviewProjectState.INSTANCE);
    expect(updatedProject.consensuality).toBeNull();
    for (const consensuality of updatedProject.reviewTopics) {
      expect(consensuality).not.toBeNull();
    }
    expect(updatedProject.contributions.toArray()).toHaveLength(
      updatedProject.roles.toArray().length *
        updatedProject.reviewTopics.toArray().length,
    );
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
    if (!updatedProject) {
      throw new Error();
    }
    const sentPeerReviews = Array.from(
      updatedProject.peerReviews.findBySenderRole(role1.id),
    );
    expect(sentPeerReviews).toHaveLength(3);
    for (const sentPeerReview of sentPeerReviews) {
      expect(sentPeerReview.score.value).toBe(
        peerReviews[role1.id.value][sentPeerReview.receiverRoleId.value],
      );
    }
    expect(updatedProject.state).toBe(PeerReviewProjectState.INSTANCE);
    expect(updatedProject.contributions.toArray()).toHaveLength(0);
  });

  test('should fail if project is not in peer-review state', async () => {
    project.state = FormationProjectState.INSTANCE;
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
