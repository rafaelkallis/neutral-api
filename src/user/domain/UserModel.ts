import { AbstractModel } from 'common';
import { IsNumber, IsString, MaxLength, IsEmail } from 'class-validator';

export class UserModel extends AbstractModel {
  @IsEmail()
  @MaxLength(100)
  public email: string;

  @IsString()
  @MaxLength(100)
  public firstName: string;

  @IsString()
  @MaxLength(100)
  public lastName: string;

  @IsNumber()
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
