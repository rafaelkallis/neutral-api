import td from 'testdouble';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { OrganizationRepository } from 'organization/domain/OrganizationRepository';
import { Organization } from 'organization/domain/Organization';
import { OrganizationDto } from 'organization/presentation/OrganizationDto';
import {
  AddMembershipCommand,
  AddMembershipCommandHandler,
} from './AddMembership';
import { UserRepository } from 'user/domain/UserRepository';
import { OrganizationId } from 'organization/domain/value-objects/OrganizationId';
import { UserId } from 'user/domain/value-objects/UserId';
import { Either } from 'shared/domain/Either';

describe(AddMembershipCommand.name, () => {
  let scenario: UnitTestScenario<AddMembershipCommandHandler>;
  let commandHandler: AddMembershipCommandHandler;
  let organizationRepository: OrganizationRepository;
  let userRepository: UserRepository;
  let owner: User;
  let memberId: UserId;
  let member: User;
  let organizationId: OrganizationId;
  let command: AddMembershipCommand;
  let organization: Organization;
  let organizationDto: OrganizationDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(AddMembershipCommandHandler)
      .addProviderMock(ObjectMapper)
      .addProviderMock(OrganizationRepository)
      .addProviderMock(UserRepository)
      .build();
    commandHandler = scenario.subject;
    organizationRepository = scenario.module.get(OrganizationRepository);
    userRepository = scenario.module.get(UserRepository);
    owner = scenario.modelFaker.user();
    memberId = UserId.create();
    organizationId = OrganizationId.create();
    command = new AddMembershipCommand(
      owner,
      organizationId,
      Either.left(memberId),
    );

    organization = td.object();
    td.when(organizationRepository.findById(organizationId)).thenResolve(
      organization,
    );
    td.when(organization.memberships.isAnyMember(member)).thenReturn(false);

    member = td.object();
    td.when(userRepository.findById(memberId)).thenResolve(member);

    const objectMapper = scenario.module.get(ObjectMapper);
    organizationDto = td.object();
    td.when(
      objectMapper.map(organization, OrganizationDto, td.matchers.anything()),
    ).thenResolve(organizationDto);
  });

  test('happy path', async () => {
    const actualOrganizationDto = await commandHandler.handle(command);
    expect(actualOrganizationDto).toBe(organizationDto);
    td.verify(organizationRepository.persist(organization));
  });

  test('when authenticated user is not creator, should fail', async () => {
    const error = new Error();
    td.when(organization.assertOwner(owner.id)).thenThrow(error);
    await expect(commandHandler.handle(command)).rejects.toThrowError(error);
  });

  test('when member to assign is already assigned, should fail', async () => {
    organization.memberships = td.object();
    td.when(organization.memberships.isAnyMember(member)).thenReturn(true);
    await expect(commandHandler.handle(command)).rejects.toThrowError();
  });
});
