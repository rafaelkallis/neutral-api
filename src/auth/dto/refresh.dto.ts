import { ApiModelProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

interface RefreshDtoOptions {
  refreshToken: string;
}

/**
 * Refresh DTO
 */
export class RefreshDto {
  @IsString()
  @ApiModelProperty({
    example: '',
    description: 'Refresh token to consume',
  })
  public refreshToken!: string;

  private constructor() {}

  public static from({ refreshToken }: RefreshDtoOptions): RefreshDto {
    const dto = new RefreshDto();
    dto.refreshToken = refreshToken;
    return dto;
  }
}
