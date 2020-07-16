import { MjmlEmailHtmlRenderer } from 'shared/email/html-renderer/mjml/MjmlEmailHtmlRenderer';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { Environment } from 'shared/utility/application/Environment';
import {
  RoleCtaModel,
  ProjectCtaModel,
} from 'shared/email/manager/EmailManager';

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
    const html = mjmlEmailHtmlRenderer.renderLoginEmailHtml({
      firstName: 'Bubbles',
      ctaActionUrl: 'https://example.com/login',
    });
    expect(html).toMatchSnapshot();
  });

  test('should render signup html', () => {
    const html = mjmlEmailHtmlRenderer.renderSignupEmailHtml({
      ctaActionUrl: 'https://example.com/signup',
    });
    expect(html).toMatchSnapshot();
  });

  test('should render email change html', () => {
    const html = mjmlEmailHtmlRenderer.renderEmailChangeEmailHtml({
      firstName: 'Mike',
      ctaActionUrl: 'https://example.com/email-change',
    });
    expect(html).toEqual(expect.any(String));
  });

  test('should render user assigned html', () => {
    const model: RoleCtaModel = {
      firstName: 'Julian',
      projectTitle: 'My Project',
      roleTitle: 'Lead Engineer',
      ctaActionUrl: 'http://example.com',
    };
    const html = mjmlEmailHtmlRenderer.renderNewAssignmentEmailHtml(model);
    expect(html).toMatchSnapshot();
  });

  test('should render invited user assigned html', () => {
    const model: RoleCtaModel = {
      firstName: 'Jamie',
      projectTitle: 'My Project',
      roleTitle: 'Lead Engineer',
      ctaActionUrl: 'http://example.com',
    };
    const html = mjmlEmailHtmlRenderer.renderInvitedUserNewAssignmentEmailHtml(
      model,
    );
    expect(html).toMatchSnapshot();
  });

  test('should render peer review requested html', () => {
    const model: ProjectCtaModel = {
      firstName: 'Jeff',
      projectTitle: 'My Project',
      ctaActionUrl: 'http://example.com',
    };
    const html = mjmlEmailHtmlRenderer.renderPeerReviewRequestedEmailHtml(
      model,
    );
    expect(html).toMatchSnapshot();
  });

  test('should render manager review requested html', () => {
    const model: ProjectCtaModel = {
      firstName: 'George',
      projectTitle: 'My Project',
      ctaActionUrl: 'http://example.com',
    };
    const html = mjmlEmailHtmlRenderer.renderManagerReviewRequestedEmailHtml(
      model,
    );
    expect(html).toMatchSnapshot();
  });

  test('should render project finished html', () => {
    const model: ProjectCtaModel = {
      firstName: 'Randy',
      projectTitle: 'My Project',
      ctaActionUrl: 'http://example.com',
    };
    const html = mjmlEmailHtmlRenderer.renderProjectFinishedEmailHtml(model);
    expect(html).toMatchSnapshot();
  });
});
