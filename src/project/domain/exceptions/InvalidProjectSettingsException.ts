import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if project settings are invalid.
 */
export class InvalidProjectSettingsException extends BadRequestException {
  public constructor() {
    super('Invalid project settings', 'invalid_project_settings');
  }
}
