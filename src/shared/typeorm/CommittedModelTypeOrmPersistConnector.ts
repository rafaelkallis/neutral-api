import { Injectable } from '@nestjs/common';
import { UnitOfWork } from 'shared/unit-of-work/domain/UnitOfWork';
import { ReadonlyModel } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';
import { TypeOrmEntityRegistry } from './TypeOrmEntityRegistry';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { TypeOrmClient } from 'shared/typeorm/TypeOrmClient';
import { Connector } from 'shared/application/Connector';

@Injectable()
export class CommittedModelTypeOrmPersistConnector extends Connector {
  private readonly unitOfWork: UnitOfWork;
  private readonly typeOrmEntityRegistry: TypeOrmEntityRegistry;
  private readonly objectMapper: ObjectMapper;
  private readonly typeOrmClient: TypeOrmClient;

  public constructor(
    unitOfWork: UnitOfWork,
    typeOrmEntityRegistry: TypeOrmEntityRegistry,
    objectMapper: ObjectMapper,
    typeOrmClient: TypeOrmClient,
  ) {
    super();
    this.unitOfWork = unitOfWork;
    this.typeOrmEntityRegistry = typeOrmEntityRegistry;
    this.objectMapper = objectMapper;
    this.typeOrmClient = typeOrmClient;
  }

  protected async connect(): Promise<void> {
    const subscription = await this.unitOfWork.committedModels.subscribe({
      handle: async ([model, state]) =>
        state.accept({
          visitClean: async () => {},
          visitNew: async () => this.updateModel(model),
          visitDirty: async () => this.insertModel(model),
        }),
    });
    this.manageSuscription(subscription);
  }

  private async insertModel(model: ReadonlyModel<Id>): Promise<void> {
    const typeOrmEntityType = this.typeOrmEntityRegistry.get(model.getType());
    const typeOrmEntity = this.objectMapper.map(model, typeOrmEntityType);
    await this.typeOrmClient.entityManager.insert(
      typeOrmEntityType,
      typeOrmEntity,
    );
  }

  private async updateModel(model: ReadonlyModel<Id>): Promise<void> {
    for (const removedModel of model.getRemovedModels()) {
      await this.removeModel(removedModel);
    }
    const typeOrmEntityType = this.typeOrmEntityRegistry.get(model.getType());
    const typeOrmEntity = this.objectMapper.map(model, typeOrmEntityType);
    await this.typeOrmClient.entityManager.save(
      typeOrmEntityType,
      typeOrmEntity,
    );
  }

  private async removeModel(model: ReadonlyModel<Id>): Promise<void> {
    const typeOrmEntityType = this.typeOrmEntityRegistry.get(model.getType());
    const typeOrmEntity = this.objectMapper.map(model, typeOrmEntityType);
    await this.typeOrmClient.entityManager.delete(
      typeOrmEntityType,
      typeOrmEntity.id,
    );
  }
}
