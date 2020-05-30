import {
  Injectable,
  Type,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { AbstractTypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { ReadonlyModel } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';

@Injectable()
export class TypeOrmEntityRegistry {
  private readonly logger: Logger;
  private readonly registry: Map<
    Type<ReadonlyModel<Id>>,
    Type<AbstractTypeOrmEntity>
  >;

  public constructor() {
    this.logger = new Logger(TypeOrmEntityRegistry.name);
    this.registry = new Map();
  }

  public register(
    modelType: Type<ReadonlyModel<Id>>,
    typeOrmEntityType: Type<AbstractTypeOrmEntity>,
  ): void {
    if (this.registry.has(modelType)) {
      throw new InternalServerErrorException(
        `TypeOrm entity for ${modelType.name} already registered, only 1 typeorm allowed per model`,
      );
    }
    this.registry.set(modelType, typeOrmEntityType);
    this.logger.log(
      `Registered {${modelType.name}, ${typeOrmEntityType.name}} TypeOrm entity`,
    );
  }

  public get(modelType: Type<ReadonlyModel<Id>>): Type<AbstractTypeOrmEntity> {
    const typeOrmEntityType = this.registry.get(modelType);
    if (!typeOrmEntityType) {
      throw new InternalServerErrorException(
        `No TypeOrm entity for ${modelType.name} found`,
      );
    }
    return typeOrmEntityType;
  }
}
