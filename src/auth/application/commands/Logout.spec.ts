import td from 'testdouble';
import {
  LogoutCommand,
  LogoutCommandHandler,
} from 'auth/application/commands/Logout';
import { SessionState } from 'shared/session';

describe(LogoutCommand.name, () => {
  let session: SessionState;
  let command: LogoutCommand;
  let commandHandler: LogoutCommandHandler;

  beforeEach(async () => {
    session = td.object<SessionState>();
    command = new LogoutCommand(session);
    commandHandler = new LogoutCommandHandler();
  });

  test('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  test('happy path', async () => {
    await commandHandler.handle(command);
    td.verify(session.clear());
  });
});
