import { Command } from './Command';

export interface CommandHandler<T, TCommand extends Command<T>> {
  handleCommand(command: TCommand): Promise<T>;
}
