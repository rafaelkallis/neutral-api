import { AbstractModel } from 'common/domain/AbstractModel';
import { TypeOrmEntity } from 'common/infrastructure/TypeOrmEntity';

export interface TypeOrmEntityMapperService<
  TModel extends AbstractModel,
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
