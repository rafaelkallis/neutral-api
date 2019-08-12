import { ApiModelProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  MaxLength,
  validateOrReject,
} from 'class-validator';
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  PrimaryColumn,
} from 'typeorm';

import { BigIntTransformer } from './bigint-transformer';

/**
 * Base Entity
 */
export class BaseEntity {
  @PrimaryColumn()
  @IsString()
  @MaxLength(20)
  @ApiModelProperty()
  public id!: string;

  @Column({ name: 'created_at', transformer: new BigIntTransformer() })
  @IsNumber()
  @ApiModelProperty()
  public createdAt!: number;

  @Column({ name: 'updated_at', transformer: new BigIntTransformer() })
  @IsNumber()
  @ApiModelProperty()
  public updatedAt!: number;

  /**
   * Hook called before the entity is inserted.
   */
  @BeforeInsert()
  public async beforeInsert(): Promise<void> {
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    await validateOrReject(this);
  }

  /**
   * Hook called before the entity is updated.
   */
  @BeforeUpdate()
  public async beforeUpdate(): Promise<void> {
    this.updatedAt = Date.now();
    await validateOrReject(this);
  }

  /**
   * Hook called after the entity is loaded.
   */
  @AfterLoad()
  public async afterLoad(): Promise<void> {
    await validateOrReject(this);
  }
}
