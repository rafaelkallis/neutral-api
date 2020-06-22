import { Project } from 'project/domain/project/Project';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { HttpStatus } from '@nestjs/common';
import { ContinuousReviewTopicInput } from 'project/domain/review-topic/ReviewTopicInput';

describe('add review topic (e2e)', () => {
  let scenario: IntegrationTestScenario;
  let project: Project;
  let title: string;
  let description: string;
  let input: any;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    const user = await scenario.createUser();
    await scenario.authenticateUser(user);
    project = await scenario.createProject(user);

    title = scenario.primitiveFaker.word();
    description = scenario.primitiveFaker.paragraph();
    input = {
      type: 'continuous',
      min: 0,
      max: 1 + scenario.primitiveFaker.integer(),
    };
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('happy path', async () => {
    const response = await scenario.session
      .post(`/projects/${project.id.value}/review-topics`)
      .send({ title, description, input });
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: project.id.value,
        reviewTopics: expect.arrayContaining([
          {
            id: expect.any(String),
            title,
            description,
            input,
            consensuality: null,
            createdAt: expect.any(Number),
            updatedAt: expect.any(Number),
          },
        ]),
      }),
    );
    const updatedProject = await scenario.projectRepository.findById(
      project.id,
    );
    if (!updatedProject) {
      throw new Error();
    }
    const reviewTopic = updatedProject.reviewTopics.first();
    expect(reviewTopic.input).toBeInstanceOf(ContinuousReviewTopicInput);
    expect((reviewTopic.input as ContinuousReviewTopicInput).min).toBe(
      input.min,
    );
    expect((reviewTopic.input as ContinuousReviewTopicInput).max).toBe(
      input.max,
    );
  });
});
