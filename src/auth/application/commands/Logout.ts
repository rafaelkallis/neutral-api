import { Command } from 'shared/command/Command';
import {
  AbstractCommandHandler,
  CommandHandler,
} from 'shared/command/CommandHandler';
import { SessionState } from 'shared/session';

/**
 * Logout
 */
export class LogoutCommand extends Command<void> {
  public readonly session: SessionState;

  public constructor(session: SessionState) {
    super();
    this.session = session;
  }
}

@CommandHandler(LogoutCommand)
export class LogoutCommandHandler extends AbstractCommandHandler<
  void,
  LogoutCommand
> {
  public async handle(command: LogoutCommand): Promise<void> {
    command.session.clear();
  }
}
