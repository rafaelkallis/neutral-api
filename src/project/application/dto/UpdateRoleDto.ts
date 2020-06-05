import { PickType, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { RoleDto } from './RoleDto';

export class UpdateRoleDto extends PartialType(
  PickType(RoleDto, ['title', 'description'] as const),
) {
  @IsOptional()
  public title?: string;

  @IsOptional()
  public description?: string;

  public constructor(title?: string, description?: string) {
    super();
    this.title = title;
    this.description = description;
  }
}
