import { Injectable, Abstract, Type, Inject } from '@nestjs/common';
import { ModuleRef, REQUEST, ContextId, ContextIdFactory } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class ServiceLocator {
  private readonly moduleRef: ModuleRef;
  private readonly contextId: ContextId;

  public constructor(moduleRef: ModuleRef, @Inject(REQUEST) request: Request) {
    this.moduleRef = moduleRef;
    this.contextId = ContextIdFactory.getByRequest(request);
  }

  public async getService<T>(type: Abstract<T> | Type<T>): Promise<T> {
    return this.moduleRef.resolve(type as any, this.contextId, {
      strict: false,
    });
  }
}
