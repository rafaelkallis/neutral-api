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

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    user = await scenario.createUser();
    await scenario.authenticateUser(user);
    project = scenario.modelFaker.project(user.id);
    reviewTopic = scenario.modelFaker.reviewTopic();
    project.reviewTopics.add(reviewTopic);
    await scenario.projectRepository.persist(project);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('update title', async () => {
    const title = scenario.primitiveFaker.words();
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

  test('update input', async () => {
    const input = {
      type: 'continuous',
      min: 0,
      max: 1 + scenario.primitiveFaker.integer(),
    };
    const response = await scenario.session
      .patch(
        `/projects/${project.id.value}/review-topics/${reviewTopic.id.value}`,
      )
      .send({ input });
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: project.id.value,
        reviewTopics: expect.arrayContaining([
          expect.objectContaining({
            id: reviewTopic.id.value,
            input,
          }),
        ]),
      }),
    );
  });
});
