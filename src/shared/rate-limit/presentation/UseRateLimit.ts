import { UseInterceptors, SetMetadata } from '@nestjs/common';
import {
  RateLimitInterceptor,
  RateLimitMetadata,
} from '../application/RateLimitInterceptor';

export function UseRateLimit(): MethodDecorator {
  return UseInterceptors(RateLimitInterceptor);
}

export const RateLimitResouce = (resourceKey: string): MethodDecorator =>
  SetMetadata(RateLimitMetadata.RESOURCE_KEY, resourceKey);
