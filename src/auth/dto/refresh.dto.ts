import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class RefreshDto {
  @IsString()
  @ApiModelProperty({
    example: '',
    description: 'Refresh token to consume',
  })
  refreshToken!: string;
}
