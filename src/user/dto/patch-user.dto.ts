import { IsString, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class PatchUserDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty({ required: false })
  readonly email?: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty({ required: false })
  readonly firstName?: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty({ required: false })
  readonly lastName?: string;
}
