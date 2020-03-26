import { Inject } from '@nestjs/common';

export const EMAIL_SENDER = Symbol('EMAIL_SENDER');

export function InjectEmailSender(): ParameterDecorator {
  return Inject(EMAIL_SENDER);
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 *
 */
export interface EmailSenderService {
  /**
   *
   */
  sendEmail(options: SendEmailOptions): Promise<void>;
}
