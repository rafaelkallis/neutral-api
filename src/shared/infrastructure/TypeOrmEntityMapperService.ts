import { Model } from 'shared/domain/Model';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';

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
