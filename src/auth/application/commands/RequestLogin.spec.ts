import td from 'testdouble';
import {
  RequestLoginCommand,
  RequestLoginCommandHandler,
} from 'auth/application/commands/RequestLogin';
import { UserRepository } from 'user/domain/UserRepository';
import { User } from 'user/domain/User';
import { ModelFaker } from 'test/ModelFaker';
import { LoginRequestedEvent } from '../events/LoginRequestedEvent';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';
import { CtaUrlFactory } from 'shared/urls/CtaUrlFactory';
import { UnitTestScenario } from 'test/UnitTestScenario';

describe(RequestLoginCommand.name, () => {
  let scenario: UnitTestScenario<RequestLoginCommandHandler>;
  let userRepository: UserRepository;
  let domainEventBroker: DomainEventBroker;
  let ctaUrlFactory: CtaUrlFactory;
  let requestLoginCommandHandler: RequestLoginCommandHandler;
  let user: User;
  let command: RequestLoginCommand;
  let ctaUrl: string;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(RequestLoginCommandHandler)
      .addProviderMock(UserRepository)
      .addProviderMock(DomainEventBroker)
      .addProviderMock(CtaUrlFactory)
      .build();
    requestLoginCommandHandler = scenario.subject;
    userRepository = scenario.module.get(UserRepository);
    domainEventBroker = scenario.module.get(DomainEventBroker);
    ctaUrlFactory = scenario.module.get(CtaUrlFactory);
    const modelFaker = new ModelFaker();
    user = modelFaker.user();
    command = new RequestLoginCommand(user.email.value);
    const primitiveFaker = new PrimitiveFaker();
    ctaUrl = primitiveFaker.url();
    td.when(userRepository.findByEmail(user.email)).thenResolve(user);
    td.when(ctaUrlFactory.createProjectsCtaUrl({ user })).thenReturn(ctaUrl);
  });

  test('happy path', async () => {
    await requestLoginCommandHandler.handle(command);
    td.verify(domainEventBroker.publish(td.matchers.isA(LoginRequestedEvent)));
  });
});
