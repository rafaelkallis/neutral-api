import {
  PrimaryColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  Entity,
} from 'typeorm';
import { BigIntTransformer } from 'shared/infrastructure/BigIntTransformer';
import { Model } from 'shared/domain/Model';
import { Type } from '@nestjs/common';
import { Id } from 'shared/domain/value-objects/Id';

const staticTypeOrmEntityTypes: [
  Type<Model<Id>>,
  Type<AbstractTypeOrmEntity>,
][] = [];

export function TypeOrmEntity(
  modelType: Type<Model<Id>>,
  table: string,
): ClassDecorator {
  return function (target: Function): void {
    if (!(target.prototype instanceof AbstractTypeOrmEntity)) {
      throw new TypeError(
        `${target.name} is not a typeorm entity, did you extend ${AbstractTypeOrmEntity.name} ?`,
      );
    }
    const typeOrmEntityType = target as Type<AbstractTypeOrmEntity>;
    for (const [
      existingModelType,
      existingTypeOrmEntityType,
    ] of staticTypeOrmEntityTypes) {
      if (
        existingModelType === modelType ||
        existingTypeOrmEntityType === typeOrmEntityType
      ) {
        throw new TypeError(
          `Conflicting TypeOrm Entities: {${modelType.name},${typeOrmEntityType.name}} {${existingModelType},${existingTypeOrmEntityType}}`,
        );
      }
    }
    staticTypeOrmEntityTypes.push([modelType, typeOrmEntityType]);
    Entity(table)(target);
  };
}

export function getTypeOrmEntityType(
  modelType: Type<Model<Id>>,
): Type<AbstractTypeOrmEntity> | undefined {
  for (const [
    existingModelType,
    existingTypeOrmEntityType,
  ] of staticTypeOrmEntityTypes) {
    if (existingModelType === modelType) {
      return existingTypeOrmEntityType;
    }
  }
  return undefined;
}

export function getModelType(
  typeOrmEntityType: Type<AbstractTypeOrmEntity>,
): Type<Model<Id>> | undefined {
  for (const [
    existingModelType,
    existingTypeOrmEntityType,
  ] of staticTypeOrmEntityTypes) {
    if (existingTypeOrmEntityType === typeOrmEntityType) {
      return existingModelType;
    }
  }
  return undefined;
}

/**
 * TypeOrm Entity
 */
export abstract class AbstractTypeOrmEntity {
  @PrimaryColumn()
  public id: string;

  @Column({ name: 'created_at', transformer: new BigIntTransformer() })
  public createdAt: number;

  @Column({ name: 'updated_at', transformer: new BigIntTransformer() })
  public updatedAt: number;

  public constructor(id: string, createdAt: number, updatedAt: number) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // TODO remove
  @BeforeInsert()
  public beforeInsert(): void {
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
  }

  // TODO remove
  @BeforeUpdate()
  public beforeUpdate(): void {
    this.updatedAt = Date.now();
  }
}
