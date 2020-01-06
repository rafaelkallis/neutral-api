import { IsNumber, IsString, MaxLength, validateSync } from 'class-validator';

import { Entity } from 'common/entities/entity';
import { MemoryRepository } from 'common/repositories/memory.repository';

/**
 * Memory Entity
 */
export abstract class MemoryEntity<T> implements Entity {
  @IsString()
  @MaxLength(24)
  public id: string;

  @IsNumber()
  public createdAt: number;

  @IsNumber()
  public updatedAt: number;

  private readonly repository: MemoryRepository<T, MemoryEntity<T>>;

  public constructor(
    repository: MemoryRepository<T, MemoryEntity<T>>,
    id: string,
    createdAt: number,
    updatedAt: number,
  ) {
    this.repository = repository;
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public equals(other: Entity): boolean {
    return this.id === other.id;
  }

  public async refresh(): Promise<void> {
    await this.repository.refresh(this);
  }

  public async persist(): Promise<void> {
    await this.repository.persist(this);
  }

  protected validate(): void {
    validateSync(this);
  }
}
