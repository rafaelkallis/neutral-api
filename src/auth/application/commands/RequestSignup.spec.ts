import td from 'testdouble';
import { UserRepository } from 'user/domain/UserRepository';
import { TokenManager } from 'shared/token/application/TokenManager';
import {
  RequestSignupCommand,
  RequestSignupCommandHandler,
} from 'auth/application/commands/RequestSignup';
import { Config } from 'shared/config/application/Config';
import { SignupRequestedEvent } from 'auth/application/events/SignupRequestedEvent';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { Email } from 'user/domain/value-objects/Email';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';

describe(RequestSignupCommand.name, () => {
  let userRepository: UserRepository;
  let tokenManager: TokenManager;
  let config: Config;
  let domainEventBroker: DomainEventBroker;
  let commandHandler: RequestSignupCommandHandler;
  let email: string;
  let signupToken: string;
  let command: RequestSignupCommand;

  beforeEach(async () => {
    userRepository = td.object();
    tokenManager = td.object();
    config = td.object();
    domainEventBroker = td.object();
    commandHandler = new RequestSignupCommandHandler(
      userRepository,
      tokenManager,
      config,
      domainEventBroker,
    );
    const primitiveFaker = new PrimitiveFaker();
    email = primitiveFaker.email();
    td.when(userRepository.existsByEmail(Email.from(email))).thenResolve(false);
    td.when(tokenManager.newSignupToken(email)).thenReturn(signupToken);
    td.when(config.get('FRONTEND_URL')).thenReturn('https://example.com');
    command = new RequestSignupCommand(email);
  });

  test('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  test('happy path', async () => {
    await commandHandler.handle(command);
    td.verify(domainEventBroker.publish(td.matchers.isA(SignupRequestedEvent)));
  });
});
