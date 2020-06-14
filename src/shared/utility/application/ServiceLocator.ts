import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Class } from 'shared/domain/Class';

@Injectable()
export class ServiceLocator {
  private readonly moduleRef: ModuleRef;

  public constructor(moduleRef: ModuleRef) {
    this.moduleRef = moduleRef;
  }

  public async getService<T>(type: Class<T>): Promise<T> {
    return await this.moduleRef.get(type as any, { strict: false });
  }
}
