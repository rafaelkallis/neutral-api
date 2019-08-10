import { ApiModelProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * Patch user DTO
 */
export class PatchUserDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty({ required: false })
  email?: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty({ required: false })
  firstName?: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty({ required: false })
  lastName?: string;
}
