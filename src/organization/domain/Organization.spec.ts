import { User } from 'user/domain/User';
import { ModelFaker } from 'test/ModelFaker';
import { Organization } from './Organization';

describe(Organization, () => {
  let modelFaker: ModelFaker;
  let owner: User;
  let organization: Organization;

  beforeEach(() => {
    modelFaker = new ModelFaker();
    owner = modelFaker.user();
    organization = modelFaker.organization(owner.id);
  });

  test('assert owner', () => {
    expect(() => organization.assertOwner(owner.id)).not.toThrowError();
    const user = modelFaker.user();
    expect(() => organization.assertOwner(user.id)).toThrowError();
  });

  describe('addMembership', () => {
    test('should add membership', () => {
      const member = modelFaker.user();
      expect(organization.memberships.isAnyMember(member)).toBeFalsy();
      organization.addMembership(member.id);
      expect(organization.memberships.isAnyMember(member)).toBeTruthy();
    });
  });

  describe('removeMembership', () => {
    test('should remove membership', () => {
      const member = modelFaker.user();
      expect(organization.memberships.isAnyMember(member)).toBeFalsy();
      const membership = organization.addMembership(member.id);
      expect(organization.memberships.isAnyMember(member)).toBeTruthy();
      organization.removeMembership(membership);
      expect(organization.memberships.isAnyMember(member)).toBeFalsy();
    });
  });
});
