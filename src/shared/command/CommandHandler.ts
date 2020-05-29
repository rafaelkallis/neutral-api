import { Command } from 'shared/command/Command';
import {
  AbstractRequestHandler,
  RequestHandler,
} from 'shared/mediator/RequestHandler';
import { Type, ScopeOptions } from '@nestjs/common';

export function CommandHandler(
  commandType: Type<Command<unknown>>,
  scopeOptions?: ScopeOptions,
): ClassDecorator {
  return function (target: Function): void {
    if (!(target.prototype instanceof AbstractCommandHandler)) {
      throw new Error(
        `${target.name} is not a command handler, did you extend ${AbstractCommandHandler.name} ?`,
      );
    }
    RequestHandler(commandType, scopeOptions)(target);
  };
}

export abstract class AbstractCommandHandler<
  T,
  TCommand extends Command<T>
> extends AbstractRequestHandler<T, TCommand> {}
