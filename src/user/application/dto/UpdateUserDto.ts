import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * Update user DTO
 */
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'jerry@r2d2-coins.com' })
  public email?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Gary' })
  public firstName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Sanchez' })
  public lastName?: string;

  public constructor(email?: string, firstName?: string, lastName?: string) {
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}
