import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * Update user DTO
 */
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  public email?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  public firstName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  public lastName?: string;

  public constructor(email?: string, firstName?: string, lastName?: string) {
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}
