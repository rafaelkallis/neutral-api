import { validateSync, IsString, MaxLength, IsNumber } from 'class-validator';
import {
  PrimaryColumn,
  Column,
  BeforeInsert,
  AfterLoad,
  BeforeUpdate,
} from 'typeorm';
import { BigIntTransformer } from 'common/entities/bigint-transformer';

/**
 * Abstract Entity
 */
export abstract class AbstractEntity {
  @IsString()
  @MaxLength(24)
  @PrimaryColumn()
  public id: string;

  @IsNumber()
  @Column({ name: 'created_at', transformer: new BigIntTransformer() })
  public createdAt: number;

  @IsNumber()
  @Column({ name: 'updated_at', transformer: new BigIntTransformer() })
  public updatedAt: number;

  public constructor(id: string, createdAt: number, updatedAt: number) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   *
   */
  public equals(other: AbstractEntity): boolean {
    return this.id === other.id;
  }

  /**
   *
   */
  public validate(): void {
    validateSync(this);
  }

  @BeforeInsert()
  public beforeInsert(): void {
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    this.validate();
  }

  @BeforeUpdate()
  public beforeUpdate(): void {
    this.updatedAt = Date.now();
    this.validate();
  }

  @AfterLoad()
  public afterLoad(): void {
    this.validate();
  }
}
