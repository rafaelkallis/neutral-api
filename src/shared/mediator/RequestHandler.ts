import {
  Type,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Request } from 'shared/mediator/Request';
import { MediatorRegistry } from 'shared/mediator/MediatorRegistry';

/**
 * Request Handler
 */
@Injectable()
export abstract class RequestHandler<T, TRequest extends Request<T>>
  implements OnModuleInit, OnModuleDestroy {
  private readonly mediatorRegistry: MediatorRegistry;
  public abstract getRequestType(): Type<TRequest>;
  public abstract handle(request: TRequest): T | Promise<T>;

  public constructor(mediatorRegistry: MediatorRegistry) {
    this.mediatorRegistry = mediatorRegistry;
  }

  public onModuleInit(): void {
    this.mediatorRegistry.register(this);
  }

  public onModuleDestroy(): void {
    this.mediatorRegistry.unregister(this);
  }
}
