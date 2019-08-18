import { ApiModelProperty } from '@nestjs/swagger';
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
  @ApiModelProperty({ required: false })
  public email?: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty({ required: false })
  public firstName?: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty({ required: false })
  public lastName?: string;

  private constructor() {}

  public static from(props: UpdateUserDtoProps): UpdateUserDto {
    return Object.assign(new UpdateUserDto(), props);
  }
}
