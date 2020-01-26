import { NunjucksEmailHtmlRendererService } from 'email/email-html-renderer/nunjucks-email-html-render.service';

describe('NunjucksEmailHtmlRenderer', () => {
  let nunjucksEmailHtmlRenderer: NunjucksEmailHtmlRendererService;

  beforeEach(() => {
    nunjucksEmailHtmlRenderer = new NunjucksEmailHtmlRendererService();
  });

  it('should be defined', () => {
    expect(nunjucksEmailHtmlRenderer).toBeDefined();
  });

  it('should render login html', () => {
    const html = nunjucksEmailHtmlRenderer.renderLoginEmailHtml(
      'https://example.com/login',
    );
    expect(html).toEqual(expect.any(String));
  });

  it('should render signup html', () => {
    const html = nunjucksEmailHtmlRenderer.renderSignupEmailHtml(
      'https://example.com/signup',
    );
    expect(html).toEqual(expect.any(String));
  });

  it('should render email change html', () => {
    const html = nunjucksEmailHtmlRenderer.renderEmailChangeEmailHtml(
      'https://example.com/email-change',
    );
    expect(html).toEqual(expect.any(String));
  });

  it('should render new assignment html', () => {
    const html = nunjucksEmailHtmlRenderer.renderNewAssignmentEmailHtml();
    expect(html).toEqual(expect.any(String));
  });

  it('should render unregistered user new assignment html', () => {
    const html = nunjucksEmailHtmlRenderer.renderUnregisteredUserNewAssignmentEmailHtml();
    expect(html).toEqual(expect.any(String));
  });
});
