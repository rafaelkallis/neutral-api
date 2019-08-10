import { ApiModelProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * Refresh DTO
 */
export class RefreshDto {
  @IsString()
  @ApiModelProperty({
    example: '',
    description: 'Refresh token to consume',
  })
  refreshToken!: string;
}
