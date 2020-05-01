import { ApiProperty } from '@nestjs/swagger';
import { ModelDto } from 'shared/application/dto/ModelDto';

export class ReviewTopicDto extends ModelDto {
  @ApiProperty()
  public title: string;

  @ApiProperty()
  public description: string;

  public constructor(
    id: string,
    title: string,
    description: string,
    createdAt: number,
    updatedAt: number,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
  }
}
