import { UnitTestScenario } from 'test/UnitTestScenario';
import { OrganizationFactory } from './OrganizationFactory';
import { OrganizationName } from './value-objects/OrganizationName';
import { User } from 'user/domain/User';

describe(OrganizationFactory.name, () => {
  let scenario: UnitTestScenario<OrganizationFactory>;
  let organizationFactory: OrganizationFactory;

  let name: OrganizationName;
  let owner: User;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(OrganizationFactory).build();
    organizationFactory = scenario.subject;
    name = scenario.valueObjectFaker.organization.name();
    owner = scenario.modelFaker.user();
  });

  test('should create organization', () => {
    const createdOrganization = organizationFactory.create({
      name,
      ownerId: owner.id,
    });
    expect(createdOrganization.ownerId.equals(owner.id)).toBeTruthy();
    expect(createdOrganization.memberships.isAnyMember(owner)).toBeTruthy();
  });
});
