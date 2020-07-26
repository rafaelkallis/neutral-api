import { Column, Entity, OneToMany } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { Organization } from 'organization/domain/Organization';
import { OrganizationMembershipTypeOrmEntity } from 'organization/infrastructure/OrganizationMembershipTypeOrmEntity';

@Entity('organizations')
@TypeOrmEntity.register(Organization)
export class OrganizationTypeOrmEntity extends TypeOrmEntity {
  @Column({ name: 'name', length: 128 })
  public name: string;

  @Column({ name: 'owner_id' })
  public ownerId: string;

  @OneToMany(
    () => OrganizationMembershipTypeOrmEntity,
    (membership) => membership.organization,
    {
      eager: true,
      cascade: true,
    },
  )
  public memberships: ReadonlyArray<OrganizationMembershipTypeOrmEntity>;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    name: string,
    ownerId: string,
    memberships: ReadonlyArray<OrganizationMembershipTypeOrmEntity>,
  ) {
    super(id, createdAt, updatedAt);
    this.ownerId = ownerId;
    this.name = name;
    this.ownerId = ownerId;
    this.memberships = memberships;
  }
}
