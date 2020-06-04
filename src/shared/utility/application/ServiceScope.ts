import { Inject, Injectable, Scope } from '@nestjs/common';
import { ContextId, ContextIdFactory } from '@nestjs/core';
import { REQUEST } from '@nestjs/core/router/request/request-constants';

@Injectable({ scope: Scope.DEFAULT })
export class ServiceScope {
  public readonly contextId: ContextId;

  public constructor(@Inject(REQUEST) request: Record<string, unknown>) {
    this.contextId = ContextIdFactory.getByRequest(request);
  }
}
