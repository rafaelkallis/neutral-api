import { Command } from 'shared/command/Command';
import { CommandHandler } from 'shared/command/CommandHandler';
import { SessionState } from 'shared/session';
import { Type, Injectable } from '@nestjs/common';

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
export class LogoutCommandHandler extends CommandHandler<void, LogoutCommand> {
  public async handle(command: LogoutCommand): Promise<void> {
    command.session.clear();
  }

  public getCommandType(): Type<LogoutCommand> {
    return LogoutCommand;
  }
}
