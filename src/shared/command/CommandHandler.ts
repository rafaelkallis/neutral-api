import { Command } from 'shared/command/Command';
import { RequestHandler } from 'shared/mediator/RequestHandler';
import { Class } from 'shared/domain/Class';

export abstract class CommandHandler<
  T,
  TCommand extends Command<T>
> extends RequestHandler<T, TCommand> {
  public static register(
    commandClass: Class<Command<unknown>>,
  ): ClassDecorator {
    return RequestHandler.register(commandClass);
  }
}
