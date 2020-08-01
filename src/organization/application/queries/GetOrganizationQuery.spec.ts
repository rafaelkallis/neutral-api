import td from 'testdouble';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { User } from 'user/domain/User';
import {
  GetOrganizationQuery,
  GetOrganizationQueryHandler,
} from './GetOrganizationQuery';
import { OrganizationRepository } from 'organization/domain/OrganizationRepository';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { OrganizationId } from 'organization/domain/value-objects/OrganizationId';
import { Organization } from 'organization/domain/Organization';
import { OrganizationDto } from 'organization/presentation/OrganizationDto';
import { OrganizationNotFound } from '../Exceptions';

describe(GetOrganizationQuery.name, () => {
  let scenario: UnitTestScenario<GetOrganizationQueryHandler>;
  let query: GetOrganizationQuery;
  let organizationRepository: OrganizationRepository;
  let objectMapper: ObjectMapper;
  let authUser: User;
  let organizationId: OrganizationId;
  let organization: Organization;
  let organizationDto: OrganizationDto;
  let queryHandler: GetOrganizationQueryHandler;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(GetOrganizationQueryHandler)
      .addProviderMock(OrganizationRepository)
      .addProviderMock(ObjectMapper)
      .build();
    queryHandler = scenario.subject;
    organizationRepository = scenario.module.get(OrganizationRepository);
    objectMapper = scenario.module.get(ObjectMapper);
    authUser = td.object();
    organizationId = OrganizationId.create();
    organization = td.object();
    td.when(organization.isMember(authUser)).thenReturn(true);
    organizationDto = td.object();
    query = new GetOrganizationQuery(authUser, organizationId);
    td.when(organizationRepository.findById(organizationId)).thenResolve(
      organization,
    );
    td.when(
      objectMapper.map(organization, OrganizationDto, { authUser }),
    ).thenResolve(organizationDto);
  });

  test('should get organization', async () => {
    const actualDto = await queryHandler.handle(query);
    expect(actualDto).toBe(organizationDto);
  });

  test('when organization does not exist, should throw', async () => {
    td.when(organizationRepository.findById(organizationId)).thenResolve(
      undefined,
    );
    await expect(queryHandler.handle(query)).rejects.toThrowError(
      OrganizationNotFound,
    );
  });

  test('when authenticated user is not a member, should throw', async () => {
    td.when(organization.isMember(authUser)).thenReturn(false);
    await expect(queryHandler.handle(query)).rejects.toThrowError(
      OrganizationNotFound,
    );
  });
});
