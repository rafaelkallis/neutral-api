import { Injectable, Abstract, Type, Scope } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ServiceScope } from './ServiceScope';

@Injectable({ scope: Scope.DEFAULT })
export class ServiceLocator {
  private readonly moduleRef: ModuleRef;
  private readonly serviceScope: ServiceScope;

  public constructor(moduleRef: ModuleRef, serviceScope: ServiceScope) {
    this.moduleRef = moduleRef;
    this.serviceScope = serviceScope;
  }

  public async getService<T>(type: Abstract<T> | Type<T>): Promise<T> {
    let service: T | null = null;
    if (this.serviceScope.contextId) {
      service =
        service ||
        (await this.moduleRef.resolve(
          type as any,
          this.serviceScope.contextId,
          { strict: false },
        ));
    }
    service = service || this.moduleRef.get(type as any, { strict: false });
    if (!service) {
      throw new Error(`${type.name} cannot be resolved`);
    }
    return service;
  }
}
