import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from 'user/application/dto/UserDto';

/**
 * Authentication response dto
 */
export class AuthenticationResponseDto {
  @ApiProperty({
    example: '123',
    description: 'Access token to use for authorization',
  })
  public readonly accessToken: string;

  @ApiProperty({
    example: '123',
    description: 'Refresh token to use for authorization',
  })
  public readonly refreshToken: string;

  @ApiProperty({ type: UserDto })
  public readonly user: UserDto;

  public constructor(accessToken: string, refreshToken: string, user: UserDto) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
  }
}
