import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { User } from 'user/domain/User';
import { HttpStatus } from '@nestjs/common';
import { Organization } from 'organization/domain/Organization';

describe('/organizations/:id/memberships (POST)', () => {
  let scenario: IntegrationTestScenario;
  let owner: User;
  let organization: Organization;
  let member: User;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    owner = await scenario.createUser();
    await scenario.authenticateUser(owner);
    organization = await scenario.createOrganization(owner);
    member = await scenario.createUser();
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('when "memberId" should add membership', async () => {
    const response = await scenario.session
      .post(`/organizations/${organization.id.value}/memberships`)
      .send({ memberId: member.id.value });
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: organization.id.value,
        memberships: expect.arrayContaining([
          expect.objectContaining({
            memberId: member.id.value,
          }),
        ]),
      }),
    );
    const updatedOrganization = await scenario.organizationRepository.findById(
      organization.id,
    );
    expect(updatedOrganization?.memberships.isAnyMember(member)).toBeTruthy();
  });

  test('when "memberEmail" should add membership', async () => {
    const response = await scenario.session
      .post(`/organizations/${organization.id.value}/memberships`)
      .send({ memberEmail: member.email.value });
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: organization.id.value,
        memberships: expect.arrayContaining([
          expect.objectContaining({
            memberId: member.id.value,
          }),
        ]),
      }),
    );
    const updatedOrganization = await scenario.organizationRepository.findById(
      organization.id,
    );
    expect(updatedOrganization?.memberships.isAnyMember(member)).toBeTruthy();
  });
});
