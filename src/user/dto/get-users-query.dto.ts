import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

interface GetUsersQueryDtoOptions {
  after?: string;
}

/**
 * Get users query DTO
 */
export class GetUsersQueryDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  public after?: string;

  public static from(options: GetUsersQueryDtoOptions): GetUsersQueryDto {
    return Object.assign(new GetUsersQueryDto(), options);
  }

  private constructor() {}
}
