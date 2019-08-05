import { IsString, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

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
