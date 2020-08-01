import td from 'testdouble';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UnitTestScenario } from 'test/UnitTestScenario';
import {
  CreateOrganizationCommand,
  CreateOrganizationCommandHandler,
} from './CreateOgranization';
import { OrganizationRepository } from 'organization/domain/OrganizationRepository';
import { Organization } from 'organization/domain/Organization';
import { OrganizationDto } from 'organization/presentation/OrganizationDto';
import { OrganizationFactory } from 'organization/domain/OrganizationFactory';
import { OrganizationName } from 'organization/domain/value-objects/OrganizationName';

describe(CreateOrganizationCommand.name, () => {
  let scenario: UnitTestScenario<CreateOrganizationCommandHandler>;
  let commandHandler: CreateOrganizationCommandHandler;
  let organizationRepository: OrganizationRepository;
  let authUser: User;
  let name: OrganizationName;
  let command: CreateOrganizationCommand;
  let createdOrganization: Organization;
  let organizationDto: OrganizationDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(CreateOrganizationCommandHandler)
      .addProviderMock(ObjectMapper)
      .addProviderMock(OrganizationRepository)
      .addProviderMock(OrganizationFactory)
      .build();
    commandHandler = scenario.subject;
    organizationRepository = scenario.module.get(OrganizationRepository);
    authUser = td.object(scenario.modelFaker.user());
    name = scenario.valueObjectFaker.organization.name();
    command = new CreateOrganizationCommand(authUser, name);

    const organizations = scenario.module.get(OrganizationFactory);
    createdOrganization = td.object();
    td.when(
      organizations.create({
        name,
        ownerId: authUser.id,
      }),
    ).thenReturn(createdOrganization);

    const objectMapper = scenario.module.get(ObjectMapper);
    organizationDto = td.object();
    td.when(
      objectMapper.map(
        createdOrganization,
        OrganizationDto,
        td.matchers.anything(),
      ),
    ).thenResolve(organizationDto);
  });

  test('happy path', async () => {
    const actualProjectDto = await commandHandler.handle(command);
    expect(actualProjectDto).toBe(organizationDto);
    td.verify(organizationRepository.persist(createdOrganization));
  });
});
