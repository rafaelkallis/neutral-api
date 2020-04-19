import {
  Injectable,
  Type,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { Request } from 'shared/mediator/Request';
import { MediatorRegistry } from 'shared/mediator/MediatorRegistry';

/**
 *
 */
@Injectable()
export class Mediator {
  @Inject()
  private readonly requestHandlerRegistry!: MediatorRegistry;

  public async send<T, TRequest extends Request<T>>(
    request: TRequest,
  ): Promise<T> {
    const requestType = request.constructor as Type<TRequest>;
    const requestHandler = this.requestHandlerRegistry.get<T, TRequest>(
      requestType,
    );
    if (!requestHandler) {
      throw new InternalServerErrorException(
        `No request handler for ${requestType.name} registered`,
      );
    }
    return requestHandler.handle(request);
  }
}
