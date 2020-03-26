import { DefaultEmailPlaintextRendererService } from 'shared/email/email-plaintext-renderer/default-email-plaintext-renderer.service';

describe('DefaultEmailPlaintextRenderer', () => {
  let defaultEmailPlaintextRenderer: DefaultEmailPlaintextRendererService;

  beforeEach(() => {
    defaultEmailPlaintextRenderer = new DefaultEmailPlaintextRendererService();
  });

  it('should be defined', () => {
    expect(defaultEmailPlaintextRenderer).toBeDefined();
  });

  it('should render login html', () => {
    const html = defaultEmailPlaintextRenderer.renderLoginEmailPlaintext(
      'https://example.com/login',
    );
    expect(html).toEqual(expect.any(String));
  });

  it('should render signup html', () => {
    const html = defaultEmailPlaintextRenderer.renderSignupEmailPlaintext(
      'https://example.com/signup',
    );
    expect(html).toEqual(expect.any(String));
  });

  it('should render email change html', () => {
    const html = defaultEmailPlaintextRenderer.renderEmailChangeEmailPlaintext(
      'https://example.com/email-change',
    );
    expect(html).toEqual(expect.any(String));
  });

  it('should render new assignment html', () => {
    const html = defaultEmailPlaintextRenderer.renderNewAssignmentEmailPlaintext();
    expect(html).toEqual(expect.any(String));
  });

  it('should render unregistered user new assignment html', () => {
    const html = defaultEmailPlaintextRenderer.renderUnregisteredUserNewAssignmentEmailPlaintext();
    expect(html).toEqual(expect.any(String));
  });
});
