import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { User } from 'user/domain/User';
import { HttpStatus } from '@nestjs/common';
import { OrganizationName } from 'organization/domain/value-objects/OrganizationName';

describe('/organizations (POST)', () => {
  let scenario: IntegrationTestScenario;
  let user: User;
  let name: OrganizationName;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    user = await scenario.createUser();
    await scenario.authenticateUser(user);
    name = scenario.valueObjectFaker.organization.name();
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('happy path', async () => {
    const response = await scenario.session
      .post('/organizations')
      .send({ name: name.value });
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: name.value,
        ownerId: user.id.value,
      }),
    );
    const createdOrganization = await scenario.organizationRepository.findById(
      response.body.id,
    );
    expect(createdOrganization).toBeDefined();
  });
});
