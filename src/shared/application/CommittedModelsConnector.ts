import { Injectable } from '@nestjs/common';
import { UnitOfWork } from 'shared/unit-of-work/domain/UnitOfWork';
import { Connector } from 'shared/application/Connector';
import { ReadonlyModel } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';

@Injectable()
export abstract class CommittedModelsConnector extends Connector {
  private readonly unitOfWork: UnitOfWork;

  public constructor(unitOfWork: UnitOfWork) {
    super();
    this.unitOfWork = unitOfWork;
  }

  protected async connect(): Promise<void> {
    const subscription = await this.unitOfWork.committedModels.subscribe({
      handle: async ([model, state]) =>
        state.accept({
          visitClean: async () => this.committedCleanModel(model),
          visitNew: async () => this.committedNewModel(model),
          visitDirty: async () => this.committedDirtyModel(model),
        }),
    });
    this.manageSuscription(subscription);
  }

  protected abstract committedCleanModel(
    model: ReadonlyModel<Id>,
  ): Promise<void>;
  protected abstract committedNewModel(model: ReadonlyModel<Id>): Promise<void>;
  protected abstract committedDirtyModel(
    model: ReadonlyModel<Id>,
  ): Promise<void>;
}
