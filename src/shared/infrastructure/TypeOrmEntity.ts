import { PrimaryColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { BigIntTransformer } from 'shared/infrastructure/BigIntTransformer';
import { Model } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';
import { InversableMap } from 'shared/domain/InversableMap';
import { Class } from 'shared/domain/Class';

const domainModelRegistry: InversableMap<
  Class<Model<Id>>,
  Class<TypeOrmEntity>
> = InversableMap.empty();

export abstract class TypeOrmEntity {
  @PrimaryColumn()
  public id: string;

  @Column({ name: 'created_at', transformer: new BigIntTransformer() })
  public createdAt: number;

  @Column({ name: 'updated_at', transformer: new BigIntTransformer() })
  public updatedAt: number;

  public static register(domainModelClass: Class<Model<Id>>): ClassDecorator {
    return (typeOrmEntityClass: Class<TypeOrmEntity>): void => {
      domainModelRegistry.set(domainModelClass, typeOrmEntityClass);
    };
  }

  public static registry = domainModelRegistry.asReadonly();

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
