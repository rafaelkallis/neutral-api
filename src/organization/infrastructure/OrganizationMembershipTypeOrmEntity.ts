import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { OrganizationMembership } from 'organization/domain/OrganizationMembership';
import { OrganizationTypeOrmEntity } from './OrganizationTypeOrmEntity';

@Entity('organization_memberships')
@TypeOrmEntity.register(OrganizationMembership)
export class OrganizationMembershipTypeOrmEntity extends TypeOrmEntity {
  @ManyToOne(
    () => OrganizationTypeOrmEntity,
    (organization) => organization.memberships,
  )
  @JoinColumn({ name: 'organization_id' })
  public organization: OrganizationTypeOrmEntity;

  @Column({ name: 'member_id' })
  public memberId: string;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    organization: OrganizationTypeOrmEntity,
    memberId: string,
  ) {
    super(id, createdAt, updatedAt);
    this.organization = organization;
    this.memberId = memberId;
  }
}
