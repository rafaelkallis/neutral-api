import { Column, Entity } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { Organization } from 'organization/domain/Organization';

@Entity('organizations')
@TypeOrmEntity.register(Organization)
export class OrganizationTypeOrmEntity extends TypeOrmEntity {
  @Column({ name: 'name', length: 128 })
  public name: string;

  @Column({ name: 'owner_id' })
  public ownerId: string;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    name: string,
    ownerId: string,
  ) {
    super(id, createdAt, updatedAt);
    this.ownerId = ownerId;
    this.name = name;
    this.ownerId = ownerId;
  }
}
