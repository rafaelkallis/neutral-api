import {
  ModelCollection,
  ReadonlyModelCollection,
} from 'shared/domain/ModelCollection';
import { RoleMetricId } from './value-objects/RoleMetricId';
import { RoleMetric, ReadonlyRoleMetric } from './RoleMetric';

export interface ReadonlyRoleMetricCollection
  extends ReadonlyModelCollection<RoleMetricId, ReadonlyRoleMetric> {}

export class RoleMetricCollection
  extends ModelCollection<RoleMetricId, RoleMetric>
  implements ReadonlyRoleMetricCollection {}
