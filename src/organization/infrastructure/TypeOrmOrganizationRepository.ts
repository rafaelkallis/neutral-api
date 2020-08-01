import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserId } from 'user/domain/value-objects/UserId';
import { TypeOrmClient } from 'shared/typeorm/TypeOrmClient';
import { Injectable } from '@nestjs/common';
import { TypeOrmRepository } from 'shared/typeorm/TypeOrmRepository';
import { EntityManager } from 'typeorm';
import { OrganizationRepository } from 'organization/domain/OrganizationRepository';
import { OrganizationTypeOrmEntity } from './OrganizationTypeOrmEntity';
import { OrganizationId } from 'organization/domain/value-objects/OrganizationId';
import { Organization } from 'organization/domain/Organization';
import { OrganizationMembership } from 'organization/domain/OrganizationMembership';

@Injectable()
export class TypeOrmOrganizationRepository extends OrganizationRepository {
  private readonly entityManager: EntityManager;
  private readonly typeOrmRepository: TypeOrmRepository<
    OrganizationTypeOrmEntity,
    OrganizationId,
    Organization
  >;
  private readonly objectMapper: ObjectMapper;

  public constructor(
    objectMapper: ObjectMapper,
    typeOrmClient: TypeOrmClient,
    typeOrmRepository: TypeOrmRepository<
      OrganizationTypeOrmEntity,
      OrganizationId,
      Organization
    >,
  ) {
    super();
    this.objectMapper = objectMapper;
    this.entityManager = typeOrmClient.entityManager;
    this.typeOrmRepository = typeOrmRepository;
  }

  public async findPage(afterId?: OrganizationId): Promise<Organization[]> {
    return this.typeOrmRepository.findPage(
      OrganizationTypeOrmEntity,
      Organization,
      afterId,
    );
  }

  public async findById(id: OrganizationId): Promise<Organization | undefined> {
    return this.typeOrmRepository.findById(
      OrganizationTypeOrmEntity,
      Organization,
      id,
    );
  }

  public async findByIds(
    ids: OrganizationId[],
  ): Promise<(Organization | undefined)[]> {
    return this.typeOrmRepository.findByIds(
      OrganizationTypeOrmEntity,
      Organization,
      ids,
    );
  }

  public async findByOwnerId(ownerId: UserId): Promise<Organization[]> {
    const typeOrmEntities = await this.entityManager
      .getRepository(OrganizationTypeOrmEntity)
      .find({ ownerId: ownerId.value });
    const domainEntities = this.objectMapper.mapIterable(
      typeOrmEntities,
      Organization,
    );
    return domainEntities;
  }

  protected async doPersist(...organizations: Organization[]): Promise<void> {
    // TypeOrm does not delete removed one-to-many models, have to manually delete
    const membershipIdsToDelete = organizations
      .flatMap((organization) => organization.memberships.getRemovedModels())
      .map((membership) => membership.id.value);
    if (membershipIdsToDelete.length > 0) {
      await this.entityManager.delete(
        OrganizationMembership,
        membershipIdsToDelete,
      );
    }
    await this.typeOrmRepository.persist(
      OrganizationTypeOrmEntity,
      ...organizations,
    );
  }
}
