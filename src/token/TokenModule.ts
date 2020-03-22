import { Module } from '@nestjs/common';
import { JoseJwtTokenManagerService } from 'token/infrastructure/JoseJwtTokenManagerService';
import { TokenManager } from 'token/application/TokenManager';
import { ConfigModule } from 'config/ConfigModule';

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
