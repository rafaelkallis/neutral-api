export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 *
 */
export abstract class EmailSender {
  /**
   *
   */
  public abstract sendEmail(options: SendEmailOptions): Promise<void>;
}
