import { ModelDto } from 'shared/application/dto/ModelDto';
import { ApiProperty } from '@nestjs/swagger';
import { IsIdentifier } from 'shared/validation/IsIdentifier';

export class OrganizationMembershipDto extends ModelDto {
  @ApiProperty({
    type: String,
    example: '507f1f77bcf86cd799439011',
    description: 'Id of the organization owner',
  })
  @IsIdentifier()
  public readonly memberId: string;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    memberId: string,
  ) {
    super(id, createdAt, updatedAt);
    this.memberId = memberId;
  }
}
