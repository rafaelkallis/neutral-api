import { Command } from 'shared/command/Command';
import { CommandHandler } from 'shared/command/CommandHandler';
import { SessionState } from 'shared/session';
import { Injectable } from '@nestjs/common';
import { AssociatedRequest } from 'shared/mediator/RequestHandler';

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
@AssociatedRequest.d(LogoutCommand)
export class LogoutCommandHandler extends CommandHandler<void, LogoutCommand> {
  public handle(command: LogoutCommand): void {
    command.session.clear();
  }
}
