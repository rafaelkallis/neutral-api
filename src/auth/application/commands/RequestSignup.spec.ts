import td from 'testdouble';
import { UserRepository } from 'user/domain/UserRepository';
import {
  RequestSignupCommand,
  RequestSignupCommandHandler,
} from 'auth/application/commands/RequestSignup';
import { SignupRequestedEvent } from 'auth/application/events/SignupRequestedEvent';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { MagicLinkFactory } from 'shared/magic-link/MagicLinkFactory';

describe(RequestSignupCommand.name, () => {
  let scenario: UnitTestScenario<RequestSignupCommandHandler>;
  let requestSignupCommandHandler: RequestSignupCommandHandler;
  let userRepository: UserRepository;
  let magicLinkFactory: MagicLinkFactory;
  let domainEventBroker: DomainEventBroker;
  let signupLink: string;
  let requestSignupCommand: RequestSignupCommand;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(RequestSignupCommandHandler)
      .addProviderMock(UserRepository)
      .addProviderMock(MagicLinkFactory)
      .addProviderMock(DomainEventBroker)
      .build();
    requestSignupCommandHandler = scenario.subject;
    userRepository = scenario.module.get(UserRepository);
    magicLinkFactory = scenario.module.get(MagicLinkFactory);
    domainEventBroker = scenario.module.get(DomainEventBroker);
    const email = scenario.valueObjectFaker.user.email();
    td.when(userRepository.existsByEmail(email)).thenResolve(false);
    signupLink = td.object();
    td.when(magicLinkFactory.createSignupLink(email)).thenReturn(signupLink);
    requestSignupCommand = new RequestSignupCommand(email.value);
  });

  test('happy path', async () => {
    await requestSignupCommandHandler.handle(requestSignupCommand);
    td.verify(domainEventBroker.publish(td.matchers.isA(SignupRequestedEvent)));
  });
});
