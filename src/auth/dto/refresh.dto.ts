import { ApiModelProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  @ApiModelProperty({
    example: '',
    description: 'Refresh token to consume',
  })
  refreshToken!: string;
}
