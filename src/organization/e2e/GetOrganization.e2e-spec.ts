import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { User } from 'user/domain/User';
import { HttpStatus } from '@nestjs/common';
import { Organization } from 'organization/domain/Organization';

describe('/organizations/:id (GET)', () => {
  let scenario: IntegrationTestScenario;
  let owner: User;
  let organization: Organization;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    owner = await scenario.createUser();
    await scenario.authenticateUser(owner);
    organization = await scenario.createOrganization(owner);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('when auth user is owner should get organization', async () => {
    const response = await scenario.session.get(
      `/organizations/${organization.id.value}`,
    );
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: organization.id.value,
        ownerId: owner.id.value,
      }),
    );
  });

  test('when auth user is member should get organization', async () => {
    const member = await scenario.createUser();
    organization.addMember(member.id);
    await scenario.organizationRepository.persist(organization);
    await scenario.authenticateUser(member);
    const response = await scenario.session.get(
      `/organizations/${organization.id.value}`,
    );
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: organization.id.value,
        ownerId: owner.id.value,
      }),
    );
  });

  test('when auth user is not member should respond not found', async () => {
    const user = await scenario.createUser();
    await scenario.authenticateUser(user);
    const response = await scenario.session.get(
      `/organizations/${organization.id.value}`,
    );
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(response.body).toEqual({});
  });
});
