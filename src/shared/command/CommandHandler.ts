import { Command } from 'shared/command/Command';
import { RequestHandler } from 'shared/mediator/RequestHandler';
import { Type } from '@nestjs/common';

export abstract class CommandHandler<
  T,
  TCommand extends Command<T>
> extends RequestHandler<T, TCommand> {
  public abstract getCommandType(): Type<TCommand>;

  public getRequestType(): Type<TCommand> {
    return this.getCommandType();
  }
}
