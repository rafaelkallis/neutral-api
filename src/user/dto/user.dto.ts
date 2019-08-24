import { ApiModelProperty } from '@nestjs/swagger';
import { BaseDto, UserEntity } from '../../common';

/**
 * User DTO
 */
export class UserDto extends BaseDto {
  @ApiModelProperty({ required: false })
  public email: string | null;

  @ApiModelProperty()
  public firstName: string;

  @ApiModelProperty()
  public lastName: string;

  public constructor(
    id: string,
    email: string | null,
    firstName: string,
    lastName: string,
    createdAt: number,
    updatedAt: number,
  ) {
    super(id, createdAt, updatedAt);
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

export class UserDtoBuilder {
  private readonly data: UserEntity;
  private _exposeEmail = false;

  public exposeEmail(value: boolean = true): this {
    this._exposeEmail = value;
    return this;
  }

  public build(): UserDto {
    return new UserDto(
      this.data.id,
      this._exposeEmail ? this.data.email : null,
      this.data.firstName,
      this.data.lastName,
      this.data.createdAt,
      this.data.updatedAt,
    );
  }

  public constructor(data: UserEntity) {
    this.data = data;
  }
}
