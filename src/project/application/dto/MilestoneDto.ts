import { ApiProperty } from '@nestjs/swagger';
import { ModelDto } from 'shared/application/dto/ModelDto';
import { IsString } from 'class-validator';

export class MilestoneDto extends ModelDto {
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Title of the milestone',
    example: '1st Quartal',
  })
  public title: string;

  @IsString()
  @ApiProperty({
    type: String,
    description: 'Description of the milestone',
    example: 'One of the four quartals.',
  })
  public description: string;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    title: string,
    description: string,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
  }
}
