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

export class BaseEntity {
  @PrimaryColumn()
  @IsString()
  @MaxLength(20)
  @ApiModelProperty()
  id!: string;

  @Column({ name: 'created_at', transformer: new BigIntTransformer() })
  @IsNumber()
  @ApiModelProperty()
  createdAt!: number;

  @Column({ name: 'updated_at', transformer: new BigIntTransformer() })
  @IsNumber()
  @ApiModelProperty()
  updatedAt!: number;

  @BeforeInsert()
  protected async beforeInsert() {
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    await validateOrReject(this);
  }

  @BeforeUpdate()
  protected async beforeUpdate() {
    this.updatedAt = Date.now();
    await validateOrReject(this);
  }

  @AfterLoad()
  protected async afterLoad() {
    await validateOrReject(this);
  }
}
