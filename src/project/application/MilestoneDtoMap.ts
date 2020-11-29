import { Injectable } from '@nestjs/common';
import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { Milestone } from 'project/domain/milestone/Milestone';
import { MilestoneDto } from 'project/application/dto/MilestoneDto';

@Injectable()
@ObjectMap.register(Milestone, MilestoneDto)
export class MilestoneDtoMap extends ObjectMap<Milestone, MilestoneDto> {
  protected doMap(
    milestone: Milestone,
    _context: ObjectMapContext,
  ): MilestoneDto {
    return new MilestoneDto(
      milestone.id.value,
      milestone.createdAt.value,
      milestone.updatedAt.value,
      milestone.title.value,
      milestone.description.value,
    );
  }
}
