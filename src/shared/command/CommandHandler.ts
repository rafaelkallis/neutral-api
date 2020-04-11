import { Command } from 'shared/command/Command';
import {
  RequestHandler,
  AbstractRequestHandler,
} from 'shared/mediator/RequestHandler';
import { Type, ScopeOptions } from '@nestjs/common';

export function CommandHandler<T, TCommand extends Command<T>>(
  commandType: Type<TCommand>,
  scopeOptions?: ScopeOptions,
): ClassDecorator {
  return (commandHandlerType: Function): void => {
    if (!(commandHandlerType.prototype instanceof AbstractCommandHandler)) {
      throw new TypeError(
        `${commandHandlerType.name} is not a command handler, did you extends ${AbstractCommandHandler.name} ?`,
      );
    }
    RequestHandler(commandType, scopeOptions)(commandHandlerType);
  };
}

export abstract class AbstractCommandHandler<
  T,
  TCommand extends Command<T>
> extends AbstractRequestHandler<T, TCommand> {}
