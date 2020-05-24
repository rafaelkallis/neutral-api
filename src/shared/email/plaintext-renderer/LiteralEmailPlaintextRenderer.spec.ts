import { LiteralEmailPlaintextRenderer } from 'shared/email/plaintext-renderer/LiteralEmailPlaintextRenderer';
import { InvitedUserNewAssignmentModel } from '../manager/EmailManager';
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
    expect(text).toEqual(expect.any(String));
  });

  it('should render signup text', () => {
    const text = literalEmailPlaintextRenderer.renderSignupEmailPlaintext(
      'https://example.com/signup',
    );
    expect(text).toEqual(expect.any(String));
  });

  it('should render email change text', () => {
    const text = literalEmailPlaintextRenderer.renderEmailChangeEmailPlaintext(
      'https://example.com/email-change',
    );
    expect(text).toEqual(expect.any(String));
  });

  it('should render new assignment text', () => {
    const text = literalEmailPlaintextRenderer.renderNewAssignmentEmailPlaintext();
    expect(text).toEqual(expect.any(String));
  });

  it('should render unregistered user new assignment text', () => {
    const model: InvitedUserNewAssignmentModel = {
      projectTitle: 'Neutron Collider',
      roleTitle: 'Particle Scientist',
      signupMagicLink: 'http://example.com/signup',
    };
    const text = literalEmailPlaintextRenderer.renderInvitedUserNewAssignmentEmailPlaintext(
      model,
    );
    expect(text).toMatchSnapshot();
  });
});
