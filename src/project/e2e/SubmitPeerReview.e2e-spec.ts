import { Project } from 'project/domain/project/Project';
import { Role } from 'project/domain/role/Role';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { User } from 'user/domain/User';
import { PeerReviewProjectState } from 'project/domain/project/value-objects/states/PeerReviewProjectState';
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
  let peerReviews: Record<string, number>;

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

    project.roles.addAll([role1, role2, role3, role4]);
    await scenario.projectRepository.persist(project);

    /* add review topic */
    reviewTopic = scenario.modelFaker.reviewTopic();
    project.reviewTopics.add(reviewTopic);
    await scenario.projectRepository.persist(project);

    peerReviews = {
      [role2.id.value]: 0.3,
      [role3.id.value]: 0.2,
      [role4.id.value]: 0.5,
    };
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('happy path', async () => {
    const response = await scenario.session
      .post(`/projects/${project.id.value}/submit-peer-reviews`)
      .send({ peerReviews, reviewTopicId: reviewTopic.id.value });
    expect(response.status).toBe(200);
    const updatedProject = await scenario.projectRepository.findById(
      project.id,
    );
    if (!updatedProject) {
      throw new Error();
    }
    const sentPeerReviews = updatedProject.peerReviews.whereSenderRole(
      role1.id,
    );
    expect(sentPeerReviews.toArray()).toHaveLength(3);
    for (const sentPeerReview of sentPeerReviews) {
      expect(sentPeerReview.score.value).toBe(
        peerReviews[sentPeerReview.receiverRoleId.value],
      );
    }
  });
});
