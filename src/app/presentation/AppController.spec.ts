import { AppController } from './AppController';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(() => {
    appController = new AppController();
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });
  });
});
