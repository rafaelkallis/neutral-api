import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { HttpStatus } from '@nestjs/common';

describe('app (e2e)', () => {
  let scenario: IntegrationTestScenario;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('/ (GET)', async () => {
    const response = await scenario.session.get('/');
    expect(response.status).toBe(HttpStatus.OK);
  });

  test('/status (GET)', async () => {
    const response = await scenario.session.get('/status');
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      message: expect.any(String),
      commit: expect.any(String),
    });
  });
});
