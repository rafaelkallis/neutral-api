import {
  PrimaryColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  Entity,
} from 'typeorm';
import { BigIntTransformer } from 'shared/infrastructure/BigIntTransformer';
import { BiMap, ReadonlyBiMap } from 'shared/domain/BiMap';
import { Type, Abstract } from '@nestjs/common';
import { Model } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';

const internalStaticTypeOrmEntityBiMap: BiMap<
  Type<Model<Id>>,
  Abstract<AbstractTypeOrmEntity>
> = new BiMap();
export const staticTypeOrmEntityBiMap: ReadonlyBiMap<
  Type<Model<Id>>,
  Abstract<AbstractTypeOrmEntity>
> = internalStaticTypeOrmEntityBiMap;

export function TypeOrmEntity(
  modelType: Type<Model<Id>>,
  table: string,
): ClassDecorator {
  return function (typeOrmEntityType: Abstract<AbstractTypeOrmEntity>): void {
    internalStaticTypeOrmEntityBiMap.put(modelType, typeOrmEntityType);
    Entity(table)(typeOrmEntityType);
  };
}

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
