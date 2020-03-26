import { Injectable } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';

/**
 * Explores services in the dependency injection context.
 */
@Injectable()
export class ServiceExplorer {
  private readonly modulesContainer: ModulesContainer;

  public constructor(modulesContainer: ModulesContainer) {
    this.modulesContainer = modulesContainer;
  }

  /**
   *
   */
  public exploreServices(): ReadonlyArray<object> {
    const services: object[] = [];
    for (const module of this.modulesContainer.values()) {
      for (const instanceWrapper of module.providers.values()) {
        const { instance } = instanceWrapper;
        if (
          typeof instance !== 'object' ||
          !instance ||
          !instance.constructor
        ) {
          continue;
        }
        services.push(instance);
      }
    }
    return services;
  }
}
