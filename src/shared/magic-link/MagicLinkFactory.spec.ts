import td from 'testdouble';
import { MagicLinkFactory } from './MagicLinkFactory';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { Config } from 'shared/config/application/Config';
import { Email } from 'user/domain/value-objects/Email';

describe(MagicLinkFactory.name, () => {
  let scenario: UnitTestScenario<MagicLinkFactory>;
  let magicLinkFactory: MagicLinkFactory;
  let config: Config;
  let loginToken: string;
  let email: Email;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(MagicLinkFactory)
      .addProviderMock(Config)
      .build();
    magicLinkFactory = scenario.subject;
    config = scenario.module.get(Config);
    loginToken = scenario.primitiveFaker.id();
    email = scenario.valueObjectFaker.user.email();
    td.when(config.get('FRONTEND_URL')).thenReturn('http://example.com');
  });

  test('should create login link', () => {
    const loginLink = magicLinkFactory.createLoginLink({
      loginToken,
      email,
      isNew: true,
    });
    expect(loginLink).toEqual(
      `http://example.com/login/callback?token=${loginToken}&email=${encodeURIComponent(
        email.value,
      )}&new=true`,
    );
  });
});
