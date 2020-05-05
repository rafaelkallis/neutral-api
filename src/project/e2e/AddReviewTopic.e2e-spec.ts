import { Project } from 'project/domain/project/Project';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { HttpStatus } from '@nestjs/common';

describe('add review topic (e2e)', () => {
  let scenario: IntegrationTestScenario;
  let project: Project;
  let title: string;
  let description: string;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    const user = await scenario.createUser();
    await scenario.authenticateUser(user);
    project = await scenario.createProject(user);

    title = scenario.primitiveFaker.word();
    description = scenario.primitiveFaker.paragraph();
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('happy path', async () => {
    const response = await scenario.session
      .post(`/projects/${project.id.value}/review-topics`)
      .send({ title, description });
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: project.id.value,
        reviewTopics: expect.arrayContaining([
          {
            id: expect.any(String),
            title,
            description,
            consensuality: null,
            createdAt: expect.any(Number),
            updatedAt: expect.any(Number),
          },
        ]),
      }),
    );
  });
});
