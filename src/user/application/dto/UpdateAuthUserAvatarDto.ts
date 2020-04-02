import { ApiProperty } from '@nestjs/swagger';

/**
 * Update auth user avatar dto
 */
export class UpdateAuthUserAvatarDto {
  @ApiProperty({ type: String, format: 'binary' })
  public readonly avatar: string;

  public constructor(avatar: string) {
    this.avatar = avatar;
  }
}
