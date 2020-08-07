import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { User } from 'user/domain/User';
import { HttpStatus } from '@nestjs/common';
import { Organization } from 'organization/domain/Organization';
import { ReadonlyOrganizationMembership } from 'organization/domain/OrganizationMembership';

describe('/organizations/:org_id/memberships/:membership_id (DELETE)', () => {
  let scenario: IntegrationTestScenario;
  let owner: User;
  let organization: Organization;
  let member: User;
  let membership: ReadonlyOrganizationMembership;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    owner = await scenario.createUser();
    await scenario.authenticateUser(owner);
    organization = await scenario.createOrganization(owner);
    member = await scenario.createUser();
    membership = organization.addMember(member.id);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('should remove membership', async () => {
    const response = await scenario.session.delete(
      `/organizations/${organization.id}/memberships/${membership.id}`,
    );
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: organization.id.toString(),
        memberships: expect.not.arrayContaining([
          expect.objectContaining({
            id: membership.id.toString(),
          }),
        ]),
      }),
    );
    const updatedOrganization = await scenario.organizationRepository.findById(
      organization.id,
    );
    expect(updatedOrganization?.isMember(member)).toBeFalsy();
  });
});
