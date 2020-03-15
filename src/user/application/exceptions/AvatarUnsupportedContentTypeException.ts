import { BadRequestException } from '@nestjs/common';

/**
 * Error thrown if the provided avatar has an unsupported content type.
 */
export class AvatarUnsupportedContentTypeException extends BadRequestException {
  public constructor() {
    super(
      'Avatar has unsupported content type',
      'avatar_unsupported_content_type',
    );
  }
}
