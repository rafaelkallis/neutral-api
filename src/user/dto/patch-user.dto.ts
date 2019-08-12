import { ApiModelProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

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
}
