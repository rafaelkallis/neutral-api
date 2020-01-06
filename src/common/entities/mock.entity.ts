import { IsNumber, IsString, MaxLength, validateSync } from 'class-validator';

import { Entity } from 'common/entities/entity';
import { MockRepository } from 'common/repositories/mock.repository';

/**
 * Mock Entity
 */
export abstract class MockEntity<T> implements Entity {
  @IsString()
  @MaxLength(24)
  public id: string;

  @IsNumber()
  public createdAt: number;

  @IsNumber()
  public updatedAt: number;

  private readonly repository: MockRepository<T, MockEntity<T>>;

  public constructor(
    repository: MockRepository<T, MockEntity<T>>,
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
