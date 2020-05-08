import { MjmlEmailHtmlRenderer } from 'shared/email/html-renderer/mjml/MjmlEmailHtmlRenderer';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { Environment } from 'shared/utility/application/Environment';

describe(MjmlEmailHtmlRenderer.name, () => {
  let scenario: UnitTestScenario<MjmlEmailHtmlRenderer>;
  let mjmlEmailHtmlRenderer: MjmlEmailHtmlRenderer;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(MjmlEmailHtmlRenderer)
      .addProvider(Environment)
      .build();
    mjmlEmailHtmlRenderer = scenario.subject;
  });

  it('should be defined', () => {
    expect(mjmlEmailHtmlRenderer).toBeDefined();
  });

  it('should render login html', () => {
    const html = mjmlEmailHtmlRenderer.renderLoginEmailHtml(
      'https://example.com/login',
    );
    expect(html).toEqual(expect.any(String));
  });

  it('should render signup html', () => {
    const html = mjmlEmailHtmlRenderer.renderSignupEmailHtml(
      'https://example.com/signup',
    );
    expect(html).toEqual(expect.any(String));
  });

  it('should render email change html', () => {
    const html = mjmlEmailHtmlRenderer.renderEmailChangeEmailHtml(
      'https://example.com/email-change',
    );
    expect(html).toEqual(expect.any(String));
  });

  it('should render new assignment html', () => {
    const html = mjmlEmailHtmlRenderer.renderNewAssignmentEmailHtml();
    expect(html).toEqual(expect.any(String));
  });

  it('should render unregistered user new assignment html', () => {
    const html = mjmlEmailHtmlRenderer.renderUnregisteredUserNewAssignmentEmailHtml();
    expect(html).toEqual(expect.any(String));
  });
});
