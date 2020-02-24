import { Module } from '@nestjs/common';
import { JoseJwtTokenManagerService } from 'token/infrastructure/JoseJwtTokenManagerService';
import { TOKEN_MANAGER } from 'token/application/TokenManager';
import { ConfigModule } from 'config/ConfigModule';

/**
 * Token Module
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TOKEN_MANAGER,
      useClass: JoseJwtTokenManagerService,
    },
  ],
  exports: [TOKEN_MANAGER],
})
export class TokenModule {}
