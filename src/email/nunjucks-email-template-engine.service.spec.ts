import { NunjucksEmailTemplateEngineService } from 'email/nunjucks-email-template-engine.service';

describe('NunjucksEmailTemplateEngine', () => {
  let templateEngine: NunjucksEmailTemplateEngineService;

  beforeEach(() => {
    templateEngine = new NunjucksEmailTemplateEngineService();
  });

  it('should be defined', () => {
    expect(templateEngine).toBeDefined();
  });

  it('should render login html', async () => {
    const html = await templateEngine.renderLoginHtml(
      'https://example.com/login',
    );
    expect(html).toEqual(expect.any(String));
  });

  it('should render signup html', async () => {
    const html = await templateEngine.renderSignupHtml(
      'https://example.com/signup',
    );
    expect(html).toEqual(expect.any(String));
  });

  it('should render email change html', async () => {
    const html = await templateEngine.renderEmailChangeHtml(
      'https://example.com/email-change',
    );
    expect(html).toEqual(expect.any(String));
  });

  it('should render new assignment html', async () => {
    const html = await templateEngine.renderNewAssignmentHtml();
    expect(html).toEqual(expect.any(String));
  });

  it('should render unregistered user new assignment html', async () => {
    const html = await templateEngine.renderUnregisteredUserNewAssignmentHtml();
    expect(html).toEqual(expect.any(String));
  });
});
