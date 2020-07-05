import { Injectable } from '@nestjs/common';
import { EmailPlaintextRenderer } from 'shared/email/plaintext-renderer/EmailPlaintextRenderer';
import {
  PendingUserNewAssignmentModel,
  NewAssignmentModel,
  ProjectFinishedModel,
  CtaModel,
  ProjectCtaModel,
} from 'shared/email/manager/EmailManager';

/**
 * Literal Email Plaintext Renderer
 */
@Injectable()
export class LiteralEmailPlaintextRenderer extends EmailPlaintextRenderer {
  public renderLoginEmailPlaintext(loginMagicLink: string): string {
    return `
      Hi there,

      You have requested a login.

      >> Login
      ${loginMagicLink}

      - Team Covee
    `;
  }

  /**
   *
   */
  public renderSignupEmailPlaintext(signupMagicLink: string): string {
    return `
      Hi there,

      You have requested a signup.

      >> Signup
      ${signupMagicLink}

      - Team Covee
    `;
  }

  /**
   *
   */
  public renderEmailChangeEmailPlaintext(emailChangeMagicLink: string): string {
    return `
      Hi there,

      You have requested an email change.

      >> Confirm Email
      ${emailChangeMagicLink}

      - Team Covee
    `;
  }

  /**
   *
   */
  public renderNewAssignmentEmailPlaintext(model: NewAssignmentModel): string {
    const roleToken = model.roleTitle
      ? `the role of ${model.roleTitle}`
      : `a role`;
    const projectToken = model.projectTitle || 'a project';
    return `
      Hi there,

      You were assigned ${roleToken} in ${projectToken}.

      >> See Assignment
      ${model.projectUrl}

      - Team Covee
    `;
  }

  /**
   *
   */
  public renderInvitedUserNewAssignmentEmailPlaintext(
    model: PendingUserNewAssignmentModel,
  ): string {
    const roleToken = model.roleTitle
      ? `the role of ${model.roleTitle}`
      : `a role`;
    const projectToken = model.projectTitle || 'a project';
    return `
      Hi there,

      You were assigned ${roleToken} in ${projectToken}.

      >> Get Started
      ${model.signupMagicLink}

      - Team Covee
    `;
  }

  public renderPeerReviewRequestedEmailPlaintext(
    model: ProjectCtaModel,
  ): string {
    const projectToken = model.projectTitle || 'a project';
    const ctaContent = `You are requested to submit a peer-review in ${projectToken}.`;
    return this.renderCtaPlaintext({
      ctaContent,
      ctaActionLabel: 'Submit Peer Review',
      model,
    });
  }

  public renderManagerReviewRequestedEmailPlaintext(
    model: ProjectCtaModel,
  ): string {
    const projectToken = model.projectTitle || 'a project you are a manager in';
    const ctaContent = `All peer-reviews have been submitted in ${projectToken} and you are requested to submit a manager-review.`;
    return this.renderCtaPlaintext({
      ctaContent,
      ctaActionLabel: 'Submit Manager Review',
      model,
    });
  }

  public renderProjectFinishedEmailPlaintext(
    model: ProjectFinishedModel,
  ): string {
    const projectToken = model.projectTitle || 'A project you were assigned to';
    return `
      Hi there,

      ${projectToken} has finished and the results are ready.

      >> Check Results
      ${model.projectUrl}

      - Team Covee
    `;
  }

  private renderCtaPlaintext(context: RenderCtaPlaintextContext): string {
    const nameToken = context.model.firstName || 'there';
    return `
      Hi ${nameToken},

      ${context.ctaContent}

      >> ${context.ctaActionLabel}
      ${context.model.ctaActionUrl}

      - Team Covee
    `;
  }
}

interface RenderCtaPlaintextContext {
  ctaContent: string;
  ctaActionLabel: string;
  model: CtaModel;
}
