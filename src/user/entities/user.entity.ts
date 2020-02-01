import { AbstractEntity, BigIntTransformer } from 'common';
import { Column, Entity } from 'typeorm';

/**
 * User Entity
 */
@Entity('users')
export class UserEntity extends AbstractEntity {
  @Column()
  public email: string;

  @Column({ name: 'first_name' })
  public firstName: string;

  @Column({ name: 'last_name' })
  public lastName: string;

  @Column({ name: 'last_login_at', transformer: new BigIntTransformer() })
  public lastLoginAt: number;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    email: string,
    firstName: string,
    lastName: string,
    lastLoginAt: number,
  ) {
    super(id, createdAt, updatedAt);
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.lastLoginAt = lastLoginAt;
  }
}
