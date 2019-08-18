import { ApiModelProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

interface PatchUserDtoOptions {
  email?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Patch user DTO
 */
export class PatchUserDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty({ required: false })
  public email?: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty({ required: false })
  public firstName?: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty({ required: false })
  public lastName?: string;

  private constructor() {}

  public static from({
    email,
    firstName,
    lastName,
  }: PatchUserDtoOptions): PatchUserDto {
    const dto = new PatchUserDto();
    dto.email = email;
    dto.firstName = firstName;
    dto.lastName = lastName;
    return dto;
  }
}
