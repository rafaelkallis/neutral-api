import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { User } from 'user/domain/User';
import { HttpStatus } from '@nestjs/common';
import { Organization } from 'organization/domain/Organization';
import { ReadonlyOrganizationMembership } from 'organization/domain/OrganizationMembership';

describe('/organizations/:org_id/memberships/:membership_id (DELETE)', () => {
  let scenario: IntegrationTestScenario;
  let owner: User;
  let organization: Organization;
  let ownerMembership: ReadonlyOrganizationMembership;
  let member1: User;
  let member2: User;
  let membership1: ReadonlyOrganizationMembership;
  let membership2: ReadonlyOrganizationMembership;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    owner = await scenario.createUser();
    organization = await scenario.createOrganization(owner);
    ownerMembership = organization.memberships.whereMember(owner);
    member1 = await scenario.createUser();
    member2 = await scenario.createUser();
    membership1 = organization.addMember(member1.id);
    membership2 = organization.addMember(member2.id);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  describe('when authenticated user is organization owner', () => {
    beforeEach(async () => {
      await scenario.authenticateUser(owner);
    });

    test('should remove membership', async () => {
      const response = await scenario.session.delete(
        `/organizations/${organization.id}/memberships/${membership1.id}`,
      );
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: organization.id.toString(),
          memberships: expect.not.arrayContaining([
            expect.objectContaining({
              id: membership1.id.toString(),
            }),
          ]),
        }),
      );
      const updatedOrganization = await scenario.organizationRepository.findById(
        organization.id,
      );
      expect(updatedOrganization?.isMember(member1)).toBeFalsy();
    });

    test('should not remove own membership', async () => {
      const response = await scenario.session.delete(
        `/organizations/${organization.id}/memberships/${ownerMembership.id}`,
      );
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      const updatedOrganization = await scenario.organizationRepository.findById(
        organization.id,
      );
      expect(updatedOrganization?.isMember(owner)).toBeTruthy();
    });
  });

  describe('when authenticated user is organization member', () => {
    beforeEach(async () => {
      await scenario.authenticateUser(member1);
    });

    test('should remove own membership', async () => {
      const response = await scenario.session.delete(
        `/organizations/${organization.id}/memberships/${membership1.id}`,
      );
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: organization.id.toString(),
          memberships: expect.not.arrayContaining([
            expect.objectContaining({
              id: membership1.id.toString(),
            }),
          ]),
        }),
      );
      const updatedOrganization = await scenario.organizationRepository.findById(
        organization.id,
      );
      expect(updatedOrganization?.isMember(member1)).toBeFalsy();
    });

    test("should not remove another member's membership", async () => {
      const user = await scenario.createUser();
      await scenario.authenticateUser(user);
      const response = await scenario.session.delete(
        `/organizations/${organization.id}/memberships/${membership2.id}`,
      );
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      const updatedOrganization = await scenario.organizationRepository.findById(
        organization.id,
      );
      expect(updatedOrganization?.isMember(member2)).toBeFalsy();
    });
  });

  describe('when authenticated user is not organization member', () => {
    let user: User;

    beforeEach(async () => {
      user = await scenario.createUser();
      await scenario.authenticateUser(user);
    });

    test('should not remove membership', async () => {
      const response = await scenario.session.delete(
        `/organizations/${organization.id}/memberships/${membership1.id}`,
      );
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      const updatedOrganization = await scenario.organizationRepository.findById(
        organization.id,
      );
      expect(updatedOrganization?.isMember(member1)).toBeTruthy();
    });
  });
});
