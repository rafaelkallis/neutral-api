import { AppController } from 'app/presentation/AppController';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { Config } from 'shared/config/application/Config';

describe('AppController', () => {
  let scenario: UnitTestScenario<AppController>;
  let appController: AppController;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(AppController)
      .addProviderMock(Config)
      .build();
    appController = scenario.subject;
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });
  });
});
