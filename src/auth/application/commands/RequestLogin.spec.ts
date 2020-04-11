import {
  RequestLoginCommand,
  RequestLoginCommandHandler,
} from 'auth/application/commands/RequestLogin';
import { UserRepository } from 'user/domain/UserRepository';
import { TokenManager } from 'shared/token/application/TokenManager';
import { FakeUserRepository } from 'user/infrastructure/FakeUserRepository';
import { FakeTokenManagerService } from 'shared/token/infrastructure/FakeTokenManagerService';
import { MockConfig } from 'shared/config/infrastructure/MockConfig';
import { FakeEventPublisherService } from 'shared/event/publisher/FakeEventPublisherService';
import { User } from 'user/domain/User';
import { ModelFaker } from 'test/ModelFaker';
import { LoginRequestedEvent } from '../events/LoginRequestedEvent';

describe(RequestLoginCommand.name, () => {
  let userRepository: UserRepository;
  let tokenManager: TokenManager;
  let config: MockConfig;
  let eventPublisher: FakeEventPublisherService;
  let commandHandler: RequestLoginCommandHandler;
  let user: User;
  let command: RequestLoginCommand;

  beforeEach(async () => {
    userRepository = new FakeUserRepository();
    tokenManager = new FakeTokenManagerService();
    config = new MockConfig();
    eventPublisher = new FakeEventPublisherService();
    commandHandler = new RequestLoginCommandHandler(
      userRepository,
      tokenManager,
      config,
      eventPublisher,
    );
    const modelFaker = new ModelFaker();
    user = modelFaker.user();
    await userRepository.persist(user);
    config.set('FRONTEND_URL', 'https://example.com');
    command = new RequestLoginCommand(user.email.value);
  });

  test('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  test('happy path', async () => {
    await commandHandler.handle(command);
    expect(eventPublisher.getPublishedEvents()).toContainEqual(
      expect.any(LoginRequestedEvent),
    );
  });
});
