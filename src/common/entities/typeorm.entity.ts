import { IsNumber, IsString, MaxLength, validateSync } from 'class-validator';
import {
  Column,
  PrimaryColumn,
  BeforeInsert,
  AfterLoad,
  BeforeUpdate,
} from 'typeorm';

import { BigIntTransformer } from './bigint-transformer';
import { Entity } from 'common/entities/entity';
import { TypeOrmRepository } from 'common/repositories/typeorm.repository';

/**
 * TypeOrm Entity
 */
export abstract class TypeOrmEntity<T> implements Entity {
  @PrimaryColumn()
  @IsString()
  @MaxLength(24)
  public id: string;

  @Column({ name: 'created_at', transformer: new BigIntTransformer() })
  @IsNumber()
  public createdAt: number;

  @Column({ name: 'updated_at', transformer: new BigIntTransformer() })
  @IsNumber()
  public updatedAt: number;

  private readonly typeOrmRepository: TypeOrmRepository<T, TypeOrmEntity<T>>;

  public constructor(
    typeOrmRepository: TypeOrmRepository<T, TypeOrmEntity<T>>,
    id: string,
    createdAt: number,
    updatedAt: number,
  ) {
    this.typeOrmRepository = typeOrmRepository;
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   *
   */
  public equals(other: Entity): boolean {
    return this.id === other.id;
  }

  /**
   *
   */
  public async refresh(): Promise<void> {
    await this.typeOrmRepository.refresh(this);
  }

  /**
   *
   */
  public async persist(): Promise<void> {
    await this.typeOrmRepository.persist(this);
  }

  /**
   *
   */
  protected validate(): void {
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
