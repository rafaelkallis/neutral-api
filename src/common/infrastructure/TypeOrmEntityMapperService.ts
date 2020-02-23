import { Model } from 'common/domain/Model';
import { TypeOrmEntity } from 'common/infrastructure/TypeOrmEntity';

export interface TypeOrmEntityMapperService<
  TModel extends Model,
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
