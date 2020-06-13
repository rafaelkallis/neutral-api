import { PrimaryColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { BigIntTransformer } from 'shared/infrastructure/BigIntTransformer';
import { Model } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';
import { Class } from 'shared/domain/Class';
import { BiMap } from 'shared/domain/BiMap';

export abstract class TypeOrmEntity {
  public static ofDomainModel(
    domainModelClass: Class<Model<Id>>,
  ): ClassDecorator {
    return (typeOrmEntityClass: Class<TypeOrmEntity>): void => {
      TypeOrmEntity._associatedDomainModels.set(
        domainModelClass,
        typeOrmEntityClass,
      );
    };
  }
  private static readonly _associatedDomainModels: BiMap<
    Class<Model<Id>>,
    Class<TypeOrmEntity>
  > = BiMap.empty();
  public static readonly associatedDomainModels = TypeOrmEntity._associatedDomainModels.asReadonly();

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
