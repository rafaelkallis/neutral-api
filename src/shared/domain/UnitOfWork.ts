import { Injectable, Scope } from '@nestjs/common';
import { Model } from './Model';
import { Id } from './value-objects/Id';
import { ModelCollection } from './ModelCollection';

@Injectable({ scope: Scope.REQUEST })
export class UnitOfWork {
  private readonly trackedModels: ModelCollection<Id, Model<Id>>;

  public constructor() {
    this.trackedModels = new ModelCollection([]);
  }

  public track(model: Model<Id>): void {
    this.trackedModels.assertNotContains(model); // needs identity map
    this.trackedModels.add(model);
  }

  public async commit(): Promise<void> {
    // TODO publish to newModelsSubject, updatedModelsSubject, readModelsSubject
  }
}
