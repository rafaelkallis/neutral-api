import { NunjucksEmailHtmlRenderer } from 'shared/email/html-renderer/nunjucks/NunjucksEmailHtmlRenderer';

describe('NunjucksEmailHtmlRenderer', () => {
  let nunjucksEmailHtmlRenderer: NunjucksEmailHtmlRenderer;

  beforeEach(() => {
    nunjucksEmailHtmlRenderer = new NunjucksEmailHtmlRenderer();
  });

  it('should be defined', () => {
    expect(nunjucksEmailHtmlRenderer).toBeDefined();
  });

  it('should render login html', () => {
    const html = nunjucksEmailHtmlRenderer.renderLoginEmailHtml({
      firstName: 'Randy',
      ctaUrl: 'https://example.com/login',
    });
    expect(html).toEqual(expect.any(String));
  });

  it('should render signup html', () => {
    const html = nunjucksEmailHtmlRenderer.renderSignupEmailHtml({
      ctaUrl: 'https://example.com/signup',
    });
    expect(html).toEqual(expect.any(String));
  });

  it('should render email change html', () => {
    const html = nunjucksEmailHtmlRenderer.renderEmailChangeEmailHtml({
      firstName: 'Lucy',
      ctaUrl: 'https://example.com/email-change',
    });
    expect(html).toEqual(expect.any(String));
  });

  it('should render new assignment html', () => {
    const html = nunjucksEmailHtmlRenderer.renderNewAssignmentEmailHtml();
    expect(html).toEqual(expect.any(String));
  });

  it('should render unregistered user new assignment html', () => {
    const html = nunjucksEmailHtmlRenderer.renderInvitedUserNewAssignmentEmailHtml();
    expect(html).toEqual(expect.any(String));
  });
});
