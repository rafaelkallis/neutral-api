import { Command } from 'shared/command/Command';
import { CommandHandler } from 'shared/command/CommandHandler';
import { SessionState } from 'shared/session';
import { Injectable } from '@nestjs/common';

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

@Injectable()
@CommandHandler.register(LogoutCommand)
export class LogoutCommandHandler extends CommandHandler<void, LogoutCommand> {
  public handle(command: LogoutCommand): void {
    command.session.clear();
  }
}
