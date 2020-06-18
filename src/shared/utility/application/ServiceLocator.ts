import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Class } from 'shared/domain/Class';

@Injectable()
export class ServiceLocator {
  private readonly moduleRef: ModuleRef;

  public constructor(moduleRef: ModuleRef) {
    this.moduleRef = moduleRef;
  }

  public async getService<T>(clazz: Class<T>): Promise<T> {
    return await this.moduleRef.get(clazz as any, { strict: false });
  }

  public async getServices<T>(classes: Iterable<Class<T>>): Promise<T[]> {
    const resolvedServices: T[] = [];
    for (const clazz of classes) {
      const resolvedClass = await this.getService(clazz);
      if (!resolvedClass) {
        continue;
      }
      resolvedServices.push(resolvedClass);
    }
    return resolvedServices;
  }
}
