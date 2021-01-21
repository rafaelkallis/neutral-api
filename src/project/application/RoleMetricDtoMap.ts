import { Injectable } from '@nestjs/common';
import { ObjectMap } from 'shared/object-mapper/ObjectMap';
import { RoleMetric } from 'project/domain/role-metric/RoleMetric';
import { RoleMetricDto } from 'project/application/dto/RoleMetricDto';

@Injectable()
@ObjectMap.register(RoleMetric, RoleMetricDto)
export class RoleMetricDtoMap extends ObjectMap<RoleMetric, RoleMetricDto> {
  protected doMap(roleMetric: RoleMetric): RoleMetricDto {
    return new RoleMetricDto(
      roleMetric.id.value,
      roleMetric.createdAt.value,
      roleMetric.updatedAt.value,
      roleMetric.milestoneId.value,
      roleMetric.reviewTopicId.value,
      roleMetric.roleId.value,
      roleMetric.contribution.value,
      roleMetric.consensuality.value,
      roleMetric.agreement.value,
    );
  }
}
