import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { User } from 'user/domain/User';
import { OrganizationName } from 'organization/domain/value-objects/OrganizationName';
import { HttpStatus } from '@nestjs/common';
import { OrganizationId } from 'organization/domain/value-objects/OrganizationId';

describe('/organizations (POST)', () => {
  let scenario: IntegrationTestScenario;
  let owner: User;
  let name: OrganizationName;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    owner = await scenario.createUser();
    await scenario.authenticateUser(owner);
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
        ownerId: owner.id.value,
      }),
    );
    const createdOrganization = await scenario.organizationRepository.findById(
      OrganizationId.of(response.body.id),
    );
    expect(createdOrganization).toBeDefined();
    expect(createdOrganization?.memberships.isAnyMember(owner)).toBeTruthy();
  });
});
