import { PickType } from '@nestjs/swagger';
import { OrganizationDto } from './OrganizationDto';

export class CreateOrganizationDto extends PickType(OrganizationDto, [
  'name',
] as const) {}
