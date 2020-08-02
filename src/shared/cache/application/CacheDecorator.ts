import {
  UseInterceptors,
  CacheInterceptor,
  ExecutionContext,
} from '@nestjs/common';
import { getAuthUser } from 'auth/application/guards/AuthGuard';

export function SharedCache(): MethodDecorator {
  return UseInterceptors(CacheInterceptor);
}

export function UserCache(): MethodDecorator {
  return UseInterceptors(UserCacheInterceptor);
}

class UserCacheInterceptor extends CacheInterceptor {
  public trackBy(ctx: ExecutionContext): string | undefined {
    const superKey = super.trackBy(ctx);
    if (superKey === undefined) {
      return undefined;
    }
    const user = getAuthUser(ctx);
    const userId = user.id.toString();
    return `${superKey};user:${userId}`;
  }
}
