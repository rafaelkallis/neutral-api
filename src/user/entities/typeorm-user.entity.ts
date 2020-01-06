import { IsEmail, IsNumber, IsString, MaxLength } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { TypeOrmEntity, BigIntTransformer } from 'common';
import { UserEntity } from 'user/entities/user.entity';
import { User } from 'user/user';
import { TypeOrmUserRepository } from 'user/repositories/typeorm-user.repository';

/**
 * User Entity
 */
@Entity('users')
export class TypeOrmUserEntity extends TypeOrmEntity<User>
  implements UserEntity {
  @Column()
  @IsEmail()
  @MaxLength(100)
  public email: string;

  @Column({ name: 'first_name' })
  @IsString()
  @MaxLength(100)
  public firstName: string;

  @Column({ name: 'last_name' })
  @IsString()
  @MaxLength(100)
  public lastName: string;

  @Column({ name: 'last_login_at', transformer: new BigIntTransformer() })
  @IsNumber()
  public lastLoginAt: number;

  public constructor(
    typeOrmUserRepository: TypeOrmUserRepository,
    id: string,
    createdAt: number,
    updatedAt: number,
    email: string,
    firstName: string,
    lastName: string,
    lastLoginAt: number,
  ) {
    super(typeOrmUserRepository, id, createdAt, updatedAt);
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.lastLoginAt = lastLoginAt;
  }
}
