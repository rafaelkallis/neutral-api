import { Column, Entity } from 'typeorm';
import { TypeOrmEntity } from 'common/infrastructure/TypeOrmEntity';
import { BigIntTransformer } from 'common/infrastructure/BigIntTransformer';

/**
 * User TypeOrm Entity
 */
@Entity('users')
export class UserTypeOrmEntity extends TypeOrmEntity {
  @Column({ name: 'email' })
  public email: string;

  @Column({ name: 'first_name' })
  public firstName: string;

  @Column({ name: 'last_name' })
  public lastName: string;

  @Column({ name: 'avatar', type: 'varchar', length: 255, nullable: true })
  public avatar: string | null;

  @Column({ name: 'last_login_at', transformer: new BigIntTransformer() })
  public lastLoginAt: number;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    email: string,
    firstName: string,
    lastName: string,
    avatar: string | null,
    lastLoginAt: number,
  ) {
    super(id, createdAt, updatedAt);
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.avatar = avatar;
    this.lastLoginAt = lastLoginAt;
  }
}
