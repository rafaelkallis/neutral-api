import { ModelDto } from 'shared/application/dto/ModelDto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, ValidateNested } from 'class-validator';
import { IsIdentifier } from 'shared/validation/IsIdentifier';
import { Type } from 'class-transformer';
import { OrganizationMembershipDto } from './OrganizationMembershipDto';

export class OrganizationDto extends ModelDto {
  @ApiProperty({
    type: String,
    example: 'Edison Inc.',
    description: 'Name of the organization',
  })
  @IsString()
  @MaxLength(128)
  public readonly name: string;

  @ApiProperty({
    type: String,
    example: '507f1f77bcf86cd799439011',
    description: 'Id of the organization owner',
  })
  @IsIdentifier()
  public readonly ownerId: string;

  @ApiProperty({ type: [OrganizationMembershipDto] })
  @ValidateNested({ each: true })
  @Type(() => OrganizationMembershipDto)
  public readonly memberships: OrganizationMembershipDto[];

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    name: string,
    ownerId: string,
    memberships: OrganizationMembershipDto[],
  ) {
    super(id, createdAt, updatedAt);
    this.name = name;
    this.ownerId = ownerId;
    this.memberships = memberships;
  }
}
