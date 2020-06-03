import { MjmlEmailHtmlRenderer } from 'shared/email/html-renderer/mjml/MjmlEmailHtmlRenderer';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { Environment } from 'shared/utility/application/Environment';
import {
  InvitedUserNewAssignmentModel,
  NewAssignmentModel,
  PeerReviewRequestedModel,
  ProjectFinishedModel,
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

  test('should render user assigned html', () => {
    const model: NewAssignmentModel = {
      projectTitle: 'My Project',
      roleTitle: 'Lead Engineer',
      projectUrl: 'http://example.com',
    };
    const html = mjmlEmailHtmlRenderer.renderNewAssignmentEmailHtml(model);
    expect(html).toMatchSnapshot();
  });

  test('should render invited user assigned html', () => {
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

  test('should render peer review requested html', () => {
    const model: PeerReviewRequestedModel = {
      projectTitle: 'My Project',
      projectUrl: 'http://example.com',
    };
    const html = mjmlEmailHtmlRenderer.renderPeerReviewRequestedEmailHtml(
      model,
    );
    expect(html).toMatchSnapshot();
  });

  test('should render project finished html', () => {
    const model: ProjectFinishedModel = {
      projectTitle: 'My Project',
      projectUrl: 'http://example.com',
    };
    const html = mjmlEmailHtmlRenderer.renderProjectFinishedEmailHtml(model);
    expect(html).toMatchSnapshot();
  });
});
