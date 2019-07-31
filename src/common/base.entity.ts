import {
  Column,
  PrimaryColumn,
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  ValueTransformer,
} from 'typeorm';
import {
  IsString,
  IsNumber,
  MaxLength,
  validateOrReject,
} from 'class-validator';
import { BigIntTransformer } from './bigint-transformer';

export class BaseEntity {
  @PrimaryColumn()
  @IsString()
  @MaxLength(20)
  id: string;

  @Column({ name: 'created_at', transformer: new BigIntTransformer() })
  @IsNumber()
  createdAt: number;

  @Column({ name: 'updated_at', transformer: new BigIntTransformer() })
  @IsNumber()
  updatedAt: number;

  @BeforeInsert()
  private async beforeInsert() {
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    await validateOrReject(this);
  }

  @BeforeUpdate()
  private async beforeUpdate() {
    this.updatedAt = Date.now();
    await validateOrReject(this);
  }

  @AfterLoad()
  private async afterLoad() {
    await validateOrReject(this);
  }
}
