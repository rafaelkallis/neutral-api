import { MjmlEmailHtmlRenderer } from 'shared/email/html-renderer/mjml/MjmlEmailHtmlRenderer';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { Environment } from 'shared/utility/application/Environment';
import { InvitedUserNewAssignmentModel } from 'shared/email/manager/EmailManager';

describe(MjmlEmailHtmlRenderer.name, () => {
  let scenario: UnitTestScenario<MjmlEmailHtmlRenderer>;
  let mjmlEmailHtmlRenderer: MjmlEmailHtmlRenderer;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(MjmlEmailHtmlRenderer)
      .addProvider(Environment)
      .build();
    mjmlEmailHtmlRenderer = scenario.subject;
  });

  test('should render login html', () => {
    const html = mjmlEmailHtmlRenderer.renderLoginEmailHtml(
      'https://example.com/login',
    );
    expect(html).toMatchSnapshot();
  });

  test('should render signup html', () => {
    const html = mjmlEmailHtmlRenderer.renderSignupEmailHtml(
      'https://example.com/signup',
    );
    expect(html).toMatchSnapshot();
  });

  test('should render email change html', () => {
    const html = mjmlEmailHtmlRenderer.renderEmailChangeEmailHtml(
      'https://example.com/email-change',
    );
    expect(html).toEqual(expect.any(String));
  });

  test('should render new assignment html', () => {
    const html = mjmlEmailHtmlRenderer.renderNewAssignmentEmailHtml();
    expect(html).toEqual(expect.any(String));
  });

  test('should render new user new assignment html', () => {
    const model: InvitedUserNewAssignmentModel = {
      projectTitle: 'My Project',
      roleTitle: 'Lead Engineer',
      signupMagicLink: 'http://example.com',
    };
    const html = mjmlEmailHtmlRenderer.renderInvitedUserNewAssignmentEmailHtml(
      model,
    );
    expect(html).toMatchSnapshot();
  });
});
