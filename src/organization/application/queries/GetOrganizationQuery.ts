import { Injectable } from '@nestjs/common';
import { Query } from 'shared/query/Query';
import { QueryHandler } from 'shared/query/QueryHandler';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { ReadonlyUser } from 'user/domain/User';
import { OrganizationDto } from 'organization/presentation/OrganizationDto';
import { OrganizationId } from 'organization/domain/value-objects/OrganizationId';
import { OrganizationRepository } from 'organization/domain/OrganizationRepository';
import { OrganizationNotFound } from '../Exceptions';

export class GetOrganizationQuery extends Query<OrganizationDto> {
  public readonly authUser: ReadonlyUser;
  public readonly organizationId: OrganizationId;

  public constructor(authUser: ReadonlyUser, organizationId: OrganizationId) {
    super();
    this.authUser = authUser;
    this.organizationId = organizationId;
  }
}

@Injectable()
@QueryHandler.register(GetOrganizationQuery)
export class GetOrganizationQueryHandler extends QueryHandler<
  OrganizationDto,
  GetOrganizationQuery
> {
  private readonly organizationRepository: OrganizationRepository;
  private readonly objectMapper: ObjectMapper;

  public constructor(
    organizationRepository: OrganizationRepository,
    objectMapper: ObjectMapper,
  ) {
    super();
    this.organizationRepository = organizationRepository;
    this.objectMapper = objectMapper;
  }

  public async handle(query: GetOrganizationQuery): Promise<OrganizationDto> {
    const organization = await this.organizationRepository.findById(
      query.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFound();
    }
    if (!organization.isMember(query.authUser)) {
      throw new OrganizationNotFound();
    }
    return this.objectMapper.map(organization, OrganizationDto, {
      authUser: query.authUser,
    });
  }
}
