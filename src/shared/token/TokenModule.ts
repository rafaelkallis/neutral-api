import { Module } from '@nestjs/common';
import { JoseJwtTokenManagerService } from 'shared/token/infrastructure/JoseJwtTokenManagerService';
import { TokenManager } from 'shared/token/application/TokenManager';
import { ConfigModule } from 'shared/config/ConfigModule';

/**
 * Token Module
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TokenManager,
      useClass: JoseJwtTokenManagerService,
    },
  ],
  exports: [TokenManager],
})
export class TokenModule {}
