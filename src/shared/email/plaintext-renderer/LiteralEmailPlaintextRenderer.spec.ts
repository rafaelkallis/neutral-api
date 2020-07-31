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
    const text = literalEmailPlaintextRenderer.renderLoginEmailPlaintext({
      firstName: 'Julian',
      ctaUrl: 'https://example.com/login',
    });
    expect(text).toMatchSnapshot();
  });

  it('should render signup text', () => {
    const text = literalEmailPlaintextRenderer.renderSignupEmailPlaintext({
      ctaUrl: 'https://example.com/signup',
    });
    expect(text).toMatchSnapshot();
  });

  it('should render email change text', () => {
    const text = literalEmailPlaintextRenderer.renderEmailChangeEmailPlaintext({
      firstName: 'Ricky',
      ctaUrl: 'https://example.com/email-change',
    });
    expect(text).toMatchSnapshot();
  });

  it('should render new assignment text', () => {
    const model: RoleCtaModel = {
      firstName: 'Randy',
      projectTitle: 'Neutron Collider',
      roleTitle: 'Particle Scientist',
      ctaUrl: 'http://example.com',
    };
    const text = literalEmailPlaintextRenderer.renderNewAssignmentEmailPlaintext(
      model,
    );
    expect(text).toMatchSnapshot();
  });

  test('should render peer review requested text', () => {
    const model: ProjectCtaModel = {
      firstName: 'Cyrus',
      projectTitle: 'My Project',
      ctaUrl: 'http://example.com',
    };
    const text = literalEmailPlaintextRenderer.renderPeerReviewRequestedEmailPlaintext(
      model,
    );
    expect(text).toMatchSnapshot();
  });

  test('should render manager review requested text', () => {
    const model: ProjectCtaModel = {
      firstName: 'Julian',
      projectTitle: 'My Project',
      ctaUrl: 'http://example.com',
    };
    const text = literalEmailPlaintextRenderer.renderManagerReviewRequestedEmailPlaintext(
      model,
    );
    expect(text).toMatchSnapshot();
  });

  test('should render project finished text', () => {
    const model: ProjectCtaModel = {
      firstName: 'Ricky',
      projectTitle: 'My Project',
      ctaUrl: 'http://example.com',
    };
    const text = literalEmailPlaintextRenderer.renderProjectFinishedEmailPlaintext(
      model,
    );
    expect(text).toMatchSnapshot();
  });
});
