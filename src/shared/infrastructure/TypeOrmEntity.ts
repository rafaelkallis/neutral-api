import { PrimaryColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { BigIntTransformer } from 'shared/infrastructure/BigIntTransformer';

/**
 * TypeOrm Entity
 */
export abstract class TypeOrmEntity {
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

  @BeforeInsert()
  public beforeInsert(): void {
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
  }

  @BeforeUpdate()
  public beforeUpdate(): void {
    this.updatedAt = Date.now();
  }
}
