import td from 'testdouble';
import {
  RequestLoginCommand,
  RequestLoginCommandHandler,
} from 'auth/application/commands/RequestLogin';
import { UserRepository } from 'user/domain/UserRepository';
import { TokenManager } from 'shared/token/application/TokenManager';
import { User } from 'user/domain/User';
import { ModelFaker } from 'test/ModelFaker';
import { LoginRequestedEvent } from '../events/LoginRequestedEvent';
import { EventPublisher } from 'shared/event/publisher/EventPublisher';
import { Config } from 'shared/config/application/Config';
import { PrimitiveFaker } from 'test/PrimitiveFaker';

describe(RequestLoginCommand.name, () => {
  let userRepository: UserRepository;
  let tokenManager: TokenManager;
  let config: Config;
  let eventPublisher: EventPublisher;
  let commandHandler: RequestLoginCommandHandler;
  let user: User;
  let command: RequestLoginCommand;
  let loginToken: string;

  beforeEach(async () => {
    userRepository = td.object();
    tokenManager = td.object();
    config = td.object();
    eventPublisher = td.object();
    commandHandler = new RequestLoginCommandHandler(
      userRepository,
      tokenManager,
      config,
      eventPublisher,
    );
    const modelFaker = new ModelFaker();
    user = modelFaker.user();
    command = new RequestLoginCommand(user.email.value);
    const primitiveFaker = new PrimitiveFaker();
    loginToken = primitiveFaker.id();
    td.when(userRepository.findByEmail(user.email)).thenResolve(user);
    td.when(config.get('FRONTEND_URL')).thenReturn('https://example.com');
    td.when(tokenManager.newLoginToken(user.id, user.lastLoginAt)).thenReturn(
      loginToken,
    );
  });

  test('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  test('happy path', async () => {
    await commandHandler.handle(command);
    td.verify(eventPublisher.publish(td.matchers.isA(LoginRequestedEvent)));
  });
});
