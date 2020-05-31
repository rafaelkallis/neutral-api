import { Command } from 'shared/command/Command';
import { AbstractRequestHandler } from 'shared/mediator/RequestHandler';

export abstract class AbstractCommandHandler<
  T,
  TCommand extends Command<T>
> extends AbstractRequestHandler<T, TCommand> {}
