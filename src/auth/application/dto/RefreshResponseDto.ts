import { ApiProperty } from '@nestjs/swagger';

/**
 * Refresh response dto
 */
export class RefreshResponseDto {
  @ApiProperty({
    example: '123',
    description: 'Access token to use for authorization',
  })
  public readonly accessToken: string;

  public constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
}
