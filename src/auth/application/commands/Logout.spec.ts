import td from 'testdouble';
import {
  LogoutCommand,
  LogoutCommandHandler,
} from 'auth/application/commands/Logout';
import { SessionState } from 'shared/session';

describe(LogoutCommand.name, () => {
  let session: SessionState;
  let logoutCommand: LogoutCommand;
  let logoutCommandHandler: LogoutCommandHandler;

  beforeEach(() => {
    session = td.object<SessionState>();
    logoutCommand = new LogoutCommand(session);
    logoutCommandHandler = new LogoutCommandHandler();
  });

  test('should be defined', () => {
    expect(logoutCommandHandler).toBeDefined();
  });

  test('happy path', () => {
    logoutCommandHandler.handle(logoutCommand);
    td.verify(session.clear());
  });
});
