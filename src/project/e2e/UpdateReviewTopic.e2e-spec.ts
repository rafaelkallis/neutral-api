import { HttpStatus } from '@nestjs/common';
import { Project } from 'project/domain/project/Project';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { User } from 'user/domain/User';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';

describe('update review topic (e2e)', () => {
  let scenario: IntegrationTestScenario;
  let user: User;
  let project: Project;
  let reviewTopic: ReviewTopic;
  let title: string;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    user = await scenario.createUser();
    await scenario.authenticateUser(user);
    project = scenario.modelFaker.project(user.id);
    reviewTopic = scenario.modelFaker.reviewTopic();
    project.reviewTopics.add(reviewTopic);
    await scenario.projectRepository.persist(project);

    title = scenario.primitiveFaker.words();
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('happy path', async () => {
    const response = await scenario.session
      .patch(
        `/projects/${project.id.value}/review-topics/${reviewTopic.id.value}`,
      )
      .send({ title });
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: project.id.value,
        reviewTopics: expect.arrayContaining([
          expect.objectContaining({
            id: reviewTopic.id.value,
            title,
          }),
        ]),
      }),
    );
  });
});
