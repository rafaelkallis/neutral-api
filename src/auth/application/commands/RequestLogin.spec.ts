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
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';
import { MagicLinkFactory } from 'shared/magic-link/MagicLinkFactory';

describe(RequestLoginCommand.name, () => {
  let userRepository: UserRepository;
  let tokenManager: TokenManager;
  let magicLinkFactory: MagicLinkFactory;
  let domainEventBroker: DomainEventBroker;
  let commandHandler: RequestLoginCommandHandler;
  let user: User;
  let command: RequestLoginCommand;
  let loginToken: string;

  beforeEach(() => {
    userRepository = td.object();
    tokenManager = td.object();
    magicLinkFactory = td.object();
    domainEventBroker = td.object();
    commandHandler = new RequestLoginCommandHandler(
      userRepository,
      tokenManager,
      magicLinkFactory,
      domainEventBroker,
    );
    const modelFaker = new ModelFaker();
    user = modelFaker.user();
    command = new RequestLoginCommand(user.email.value);
    const primitiveFaker = new PrimitiveFaker();
    loginToken = primitiveFaker.id();
    td.when(userRepository.findByEmail(user.email)).thenResolve(user);
    td.when(
      magicLinkFactory.createLoginLink(td.matchers.anything()),
    ).thenReturn('https://example.com');
    td.when(
      tokenManager.newLoginToken(user.email, user.lastLoginAt),
    ).thenReturn(loginToken);
  });

  test('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  test('happy path', async () => {
    await commandHandler.handle(command);
    td.verify(domainEventBroker.publish(td.matchers.isA(LoginRequestedEvent)));
  });
});
