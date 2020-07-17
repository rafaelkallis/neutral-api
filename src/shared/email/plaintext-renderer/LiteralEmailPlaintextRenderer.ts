import { Injectable } from '@nestjs/common';
import { EmailPlaintextRenderer } from 'shared/email/plaintext-renderer/EmailPlaintextRenderer';
import {
  CtaModel,
  ProjectCtaModel,
  RoleCtaModel,
  CtaModelWithFirstName,
} from 'shared/email/manager/EmailManager';

/**
 * Literal Email Plaintext Renderer
 */
@Injectable()
export class LiteralEmailPlaintextRenderer extends EmailPlaintextRenderer {
  public renderLoginEmailPlaintext(model: CtaModelWithFirstName): string {
    return this.renderCtaPlaintext({
      ctaContent: `You have requested a login.`,
      ctaLabel: 'Login',
      model,
    });
  }

  /**
   *
   */
  public renderSignupEmailPlaintext(model: CtaModel): string {
    return this.renderCtaPlaintext({
      ctaContent: `You have requested a signup.`,
      ctaLabel: 'Signup',
      model: { ...model, firstName: 'there' },
    });
  }

  /**
   *
   */
  public renderEmailChangeEmailPlaintext(model: CtaModelWithFirstName): string {
    return this.renderCtaPlaintext({
      ctaContent: `You have requested an email change.`,
      ctaLabel: 'Confirm Email',
      model,
    });
  }

  /**
   *
   */
  public renderNewAssignmentEmailPlaintext(model: RoleCtaModel): string {
    const roleToken = model.roleTitle
      ? `the role of "${model.roleTitle}"`
      : `a role`;
    return this.renderCtaPlaintext({
      ctaContent: `You are assigned ${roleToken} in "${model.projectTitle}".`,
      ctaLabel: 'See Assignment',
      model,
    });
  }

  public renderPeerReviewRequestedEmailPlaintext(
    model: ProjectCtaModel,
  ): string {
    return this.renderCtaPlaintext({
      ctaContent: `You are requested to submit a peer-review in "${model.projectTitle}".`,
      ctaLabel: 'Submit Peer Review',
      model,
    });
  }

  public renderManagerReviewRequestedEmailPlaintext(
    model: ProjectCtaModel,
  ): string {
    return this.renderCtaPlaintext({
      ctaContent: `All peer-reviews have been submitted in "${model.projectTitle}" and you are requested to submit a manager-review.`,
      ctaLabel: 'Submit Manager Review',
      model,
    });
  }

  public renderProjectFinishedEmailPlaintext(model: ProjectCtaModel): string {
    return this.renderCtaPlaintext({
      ctaContent: `Project "${model.projectTitle}" is finished and the results are ready.`,
      ctaLabel: 'Check Results',
      model,
    });
  }

  private renderCtaPlaintext(context: RenderCtaPlaintextContext): string {
    return `
      Hi ${context.model.firstName},

      ${context.ctaContent}

      >> ${context.ctaLabel}
      ${context.model.ctaUrl}

      - Team Covee
    `;
  }
}

interface RenderCtaPlaintextContext {
  ctaContent: string;
  ctaLabel: string;
  model: CtaModelWithFirstName;
}
