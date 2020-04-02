import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * Refresh DTO
 */
export class RefreshDto {
  @IsString()
  @ApiProperty({
    example: '123',
    description: 'Refresh token to consume',
  })
  public refreshToken: string;

  public constructor(refreshToken: string) {
    this.refreshToken = refreshToken;
  }
}
