import { Command } from 'shared/command/Command';
import { RequestHandler } from 'shared/mediator/RequestHandler';

export abstract class CommandHandler<
  T,
  TCommand extends Command<T>
> extends RequestHandler<T, TCommand> {}
