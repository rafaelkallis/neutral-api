import { PickType } from '@nestjs/swagger';
import { MilestoneDto } from 'project/application/dto/MilestoneDto';

export class AddMilestoneDto extends PickType(MilestoneDto, [
  'title',
  'description',
] as const) {
  public constructor(title: string, description: string) {
    super();
    this.title = title;
    this.description = description;
  }
}
