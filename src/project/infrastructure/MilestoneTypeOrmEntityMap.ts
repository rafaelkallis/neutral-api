import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { Injectable } from '@nestjs/common';
import { Milestone } from 'project/domain/milestone/Milestone';
import { MilestoneTypeOrmEntity } from './MilestoneTypeOrmEntity';
import { MilestoneId } from 'project/domain/milestone/value-objects/MilestoneId';
import { MilestoneTitle } from 'project/domain/milestone/value-objects/MilestoneTitle';
import { MilestoneDescription } from 'project/domain/milestone/value-objects/MilestoneDescription';
import {
  getMilestoneState,
  getMilestoneStateValue,
} from 'project/domain/milestone/value-objects/states/MilestoneStateValue';
import { Project } from 'project/domain/project/Project';

@Injectable()
@ObjectMap.register(Milestone, MilestoneTypeOrmEntity)
export class MilestoneTypeOrmEntityMap extends ObjectMap<
  Milestone,
  MilestoneTypeOrmEntity
> {
  protected doMap(
    milestone: Milestone,
    ctx: ObjectMapContext,
  ): MilestoneTypeOrmEntity {
    const project = ctx.get('project', ProjectTypeOrmEntity);
    return new MilestoneTypeOrmEntity(
      milestone.id.value,
      milestone.createdAt.value,
      milestone.updatedAt.value,
      project,
      project.id,
      milestone.title.value,
      milestone.description.value,
      getMilestoneStateValue(milestone.state),
    );
  }
}

@Injectable()
@ObjectMap.register(MilestoneTypeOrmEntity, Milestone)
export class ReverseMilestoneTypeOrmEntityMap extends ObjectMap<
  MilestoneTypeOrmEntity,
  Milestone
> {
  protected doMap(
    milestone: MilestoneTypeOrmEntity,
    ctx: ObjectMapContext,
  ): Milestone {
    const project = ctx.get('project', Project);
    return Milestone.of(
      MilestoneId.of(milestone.id),
      CreatedAt.from(milestone.createdAt),
      UpdatedAt.from(milestone.updatedAt),
      MilestoneTitle.from(milestone.title),
      MilestoneDescription.from(milestone.description),
      getMilestoneState(milestone.state),
      project,
    );
  }
}
