import { LiteralEmailPlaintextRenderer } from 'shared/email/plaintext-renderer/LiteralEmailPlaintextRenderer';
import { RoleCtaModel, ProjectCtaModel } from '../manager/EmailManager';
import { UnitTestScenario } from 'test/UnitTestScenario';

describe(LiteralEmailPlaintextRenderer.name, () => {
  let scenario: UnitTestScenario<LiteralEmailPlaintextRenderer>;
  let literalEmailPlaintextRenderer: LiteralEmailPlaintextRenderer;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(
      LiteralEmailPlaintextRenderer,
    ).build();
    literalEmailPlaintextRenderer = scenario.subject;
  });

  it('should render login text', () => {
    const text = literalEmailPlaintextRenderer.renderLoginEmailPlaintext(
      'https://example.com/login',
    );
    expect(text).toMatchSnapshot();
  });

  it('should render signup text', () => {
    const text = literalEmailPlaintextRenderer.renderSignupEmailPlaintext(
      'https://example.com/signup',
    );
    expect(text).toMatchSnapshot();
  });

  it('should render email change text', () => {
    const text = literalEmailPlaintextRenderer.renderEmailChangeEmailPlaintext(
      'https://example.com/email-change',
    );
    expect(text).toMatchSnapshot();
  });

  it('should render new assignment text', () => {
    const model: RoleCtaModel = {
      projectTitle: 'Neutron Collider',
      roleTitle: 'Particle Scientist',
      ctaActionUrl: 'http://example.com',
    };
    const text = literalEmailPlaintextRenderer.renderNewAssignmentEmailPlaintext(
      model,
    );
    expect(text).toMatchSnapshot();
  });

  it('should render unregistered user new assignment text', () => {
    const model: RoleCtaModel = {
      projectTitle: 'Neutron Collider',
      roleTitle: 'Particle Scientist',
      ctaActionUrl: 'http://example.com/signup',
    };
    const text = literalEmailPlaintextRenderer.renderInvitedUserNewAssignmentEmailPlaintext(
      model,
    );
    expect(text).toMatchSnapshot();
  });

  test('should render peer review requested text', () => {
    const model: ProjectCtaModel = {
      projectTitle: 'My Project',
      ctaActionUrl: 'http://example.com',
    };
    const text = literalEmailPlaintextRenderer.renderPeerReviewRequestedEmailPlaintext(
      model,
    );
    expect(text).toMatchSnapshot();
  });

  test('should render manager review requested text', () => {
    const model: ProjectCtaModel = {
      projectTitle: 'My Project',
      ctaActionUrl: 'http://example.com',
    };
    const text = literalEmailPlaintextRenderer.renderManagerReviewRequestedEmailPlaintext(
      model,
    );
    expect(text).toMatchSnapshot();
  });

  test('should render project finished text', () => {
    const model: ProjectCtaModel = {
      projectTitle: 'My Project',
      ctaActionUrl: 'http://example.com',
    };
    const text = literalEmailPlaintextRenderer.renderProjectFinishedEmailPlaintext(
      model,
    );
    expect(text).toMatchSnapshot();
  });
});
