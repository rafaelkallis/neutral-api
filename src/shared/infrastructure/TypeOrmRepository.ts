import { EntityManager } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { DatabaseClientService } from 'shared/database/DatabaseClientService';
import { Model } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';
import { Repository } from 'shared/domain/Repository';
import { Type, Injectable } from '@nestjs/common';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';

const TYPEORM_REPOSITORY_METADATA = Symbol('TYPEORM_REPOSITORY_METADATA');

export class TypeOrmRepositoryMetadata<
  TModel extends Model,
  TEntity extends TypeOrmEntity
> {
  public readonly modelType: Type<TModel>;
  public readonly entityType: Type<TEntity>;

  public constructor(modelType: Type<TModel>, entityType: Type<TEntity>) {
    this.modelType = modelType;
    this.entityType = entityType;
  }
}

export function getTypeOrmRepositoryMetadata<
  TModel extends Model,
  TEntity extends TypeOrmEntity
>(target: object): TypeOrmRepositoryMetadata<TModel, TEntity> | undefined {
  return Reflect.getMetadata(TYPEORM_REPOSITORY_METADATA, target.constructor);
}

export function TypeOrmRepository<
  TModel extends Model,
  TEntity extends TypeOrmEntity
>(modelType: Type<TModel>, entityType: Type<TEntity>): ClassDecorator {
  const metadata = new TypeOrmRepositoryMetadata(modelType, entityType);
  return (target: Function): void => {
    if (!(target.prototype instanceof AbstractTypeOrmRepository)) {
      throw new TypeError(
        `${target.name} is not a subclass of ${AbstractTypeOrmRepository.name}, cannot apply @${TypeOrmRepository.name}()`,
      );
    }
    Reflect.defineMetadata(TYPEORM_REPOSITORY_METADATA, metadata, target);
    Injectable()(target);
  };
}

/**
 * TypeOrm Repository
 */
export abstract class AbstractTypeOrmRepository<
  TModel extends Model,
  TEntity extends TypeOrmEntity
> implements Repository<TModel> {
  protected readonly entityManager: EntityManager;
  protected readonly modelMapper: ObjectMapper;
  protected readonly modelType: Type<TModel>;
  protected readonly entityType: Type<TEntity>;

  public constructor(
    databaseClient: DatabaseClientService,
    modelMapper: ObjectMapper,
  ) {
    this.entityManager = databaseClient.getEntityManager();
    this.modelMapper = modelMapper;
    const metadata = getTypeOrmRepositoryMetadata<TModel, TEntity>(this);
    if (!metadata) {
      throw new TypeError(
        `no TypeOrmRepository metadata found on ${this.constructor.name}, did you apply @${TypeOrmRepository.name}() ?`,
      );
    }
    this.modelType = metadata.modelType;
    this.entityType = metadata.entityType;
  }

  /**
   *
   */
  public async persist(...models: TModel[]): Promise<void> {
    for (const model of models) {
      model.validate();
    }
    const entities = models.map((m) =>
      this.modelMapper.map(m, this.entityType),
    );
    await this.entityManager.save(entities);
  }

  /**
   *
   */
  public async findPage(afterId?: Id): Promise<TModel[]> {
    let builder = this.entityManager
      .getRepository(this.entityType)
      .createQueryBuilder()
      .orderBy('id', 'DESC')
      .take(10);

    if (afterId) {
      builder = builder.andWhere('id > :afterId', { afterId: afterId.value });
    }
    const entities = await builder.getMany();
    const models = entities.map((e) => this.modelMapper.map(e, this.modelType));
    return models;
  }

  /**
   *
   */
  public async findById(id: Id): Promise<TModel> {
    const entity = await this.entityManager
      .getRepository(this.entityType)
      .findOne(id.value);
    if (!entity) {
      this.throwEntityNotFoundException();
    }
    const model = this.modelMapper.map(entity, this.modelType);
    return model;
  }

  /**
   *
   */
  public async findByIds(ids: Id[]): Promise<TModel[]> {
    const entities = await this.entityManager
      .getRepository(this.entityType)
      .findByIds(ids);
    if (ids.length !== entities.length) {
      this.throwEntityNotFoundException();
    }
    const models = entities.map((e) => this.modelMapper.map(e, this.modelType));
    return models;
  }

  /**
   *
   */
  public async exists(id: Id): Promise<boolean> {
    const entity = await this.entityManager
      .getRepository(this.entityType)
      .findOne(id.value);
    return Boolean(entity);
  }

  /**
   *
   */
  public async delete(...models: TModel[]): Promise<void> {
    const ids = models.map((m) => m.id.value);
    await this.entityManager.getRepository(this.entityType).delete(ids);
  }

  /**
   * Throw entity-specific not-found exception
   */
  protected abstract throwEntityNotFoundException(): never;
}
