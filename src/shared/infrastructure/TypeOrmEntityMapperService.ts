import { Model } from 'shared/domain/Model';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { Id } from 'shared/domain/value-objects/Id';

export interface TypeOrmEntityMapperService<
  TModel extends Model<Id>,
  TEntity extends TypeOrmEntity
> {
  /**
   *
   */
  toEntity(model: TModel): TEntity;

  /**
   *
   */
  toModel(entity: TEntity): TModel;
}
