import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

interface UpdateUserDtoProps {
  email?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Update user DTO
 */
export class UpdateUserDto implements UpdateUserDtoProps {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  public email?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  public firstName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  public lastName?: string;

  private constructor() {}

  public static from(props: UpdateUserDtoProps): UpdateUserDto {
    return Object.assign(new UpdateUserDto(), props);
  }
}
