import { Project } from 'project/domain/project/Project';
import { User } from 'user/domain/User';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { HttpStatus } from '@nestjs/common';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';

describe('remove review topic (e2e)', () => {
  let scenario: IntegrationTestScenario;
  let creator: User;
  let project: Project;
  let reviewTopicToRemove: ReviewTopic;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    creator = await scenario.createUser();
    await scenario.authenticateUser(creator);
    project = scenario.modelFaker.project(creator.id);
    reviewTopicToRemove = scenario.modelFaker.reviewTopic();
    project.reviewTopics.add(reviewTopicToRemove);
    await scenario.projectRepository.persist(project);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('happy path', async () => {
    const response = await scenario.session.delete(
      `/projects/${project.id.value}/review-topics/${reviewTopicToRemove.id.value}`,
    );
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: project.id.value,
        reviewTopics: expect.not.arrayContaining([
          expect.objectContaining({
            id: reviewTopicToRemove.id.value,
          }),
        ]),
      }),
    );
  });
});
