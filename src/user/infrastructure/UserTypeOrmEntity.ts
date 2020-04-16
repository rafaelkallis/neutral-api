import { Column, Entity } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { BigIntTransformer } from 'shared/infrastructure/BigIntTransformer';
import { UserStateValue } from 'user/domain/value-objects/UserState';

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

  @Column({ name: 'state', type: 'enum', enum: UserStateValue })
  public state: UserStateValue;

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
    state: UserStateValue,
    lastLoginAt: number,
  ) {
    super(id, createdAt, updatedAt);
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.avatar = avatar;
    this.state = state;
    this.lastLoginAt = lastLoginAt;
  }
}
