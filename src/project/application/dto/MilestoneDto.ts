import { ApiProperty } from '@nestjs/swagger';
import { ModelDto } from 'shared/application/dto/ModelDto';
import { IsEnum, IsString, MaxLength } from 'class-validator';
import { MilestoneStateValue } from 'project/domain/milestone/value-objects/states/MilestoneStateValue';

export class MilestoneDto extends ModelDto {
  @IsString()
  @MaxLength(100)
  @ApiProperty({
    type: String,
    description: 'Title of the milestone',
    example: '1st Quartal',
  })
  public title: string;

  @IsString()
  @MaxLength(1024)
  @ApiProperty({
    type: String,
    description: 'Description of the milestone',
    example: 'One of the four quartals.',
  })
  public description: string;

  @IsEnum(MilestoneStateValue)
  @ApiProperty({
    enum: MilestoneStateValue,
    example: MilestoneStateValue.PEER_REVIEW,
  })
  public state: MilestoneStateValue;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    title: string,
    description: string,
    state: MilestoneStateValue,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
    this.state = state;
  }
}
