import { Injectable, Inject } from '@nestjs/common';
import { ModuleRef, REQUEST, ContextId, ContextIdFactory } from '@nestjs/core';
import { Request } from 'express';
import { Class } from 'shared/domain/Class';

@Injectable()
export class ServiceLocator {
  private readonly moduleRef: ModuleRef;
  private readonly contextId: ContextId;

  public constructor(moduleRef: ModuleRef, @Inject(REQUEST) request: Request) {
    this.moduleRef = moduleRef;
    this.contextId = ContextIdFactory.getByRequest(request);
  }

  public async getService<T>(serviceClass: Class<T>): Promise<T> {
    return this.moduleRef.resolve(serviceClass as any, this.contextId, {
      strict: false,
    });
  }

  public async getServiceOrNull<T>(serviceClass: Class<T>): Promise<T | null> {
    try {
      return this.moduleRef.resolve(serviceClass as any, this.contextId, {
        strict: false,
      });
    } catch (e) {
      return null;
    }
  }
}
