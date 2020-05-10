import { HttpStatus } from '@nestjs/common';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { User } from 'user/domain/User';
import { GetAuthUserDataZipQuery } from 'user/application/queries/GetAuthUserDataZipQuery';

describe(GetAuthUserDataZipQuery.name, () => {
  let scenario: IntegrationTestScenario;
  let user: User;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    user = await scenario.createUser();
    await scenario.authenticateUser(user);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('happy path', async () => {
    const response = await scenario.session.get(`/users/me/zip`);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.type).toBe('application/zip');
    // it's hard to check if the content is correct
    expect(Number(response.get('Content-Length'))).toBeGreaterThan(200);
  });
});
