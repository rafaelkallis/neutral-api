import { TestScenario } from 'test/TestScenario';

describe('app (e2e)', () => {
  let scenario: TestScenario;

  beforeEach(async () => {
    scenario = await TestScenario.create();
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('should be defined', async () => {
    expect(scenario.app).toBeDefined();
  });

  test('/status (GET)', async () => {
    const response = await scenario.session.get('/status');
    expect(response.status).toBe(200);
  });
});
