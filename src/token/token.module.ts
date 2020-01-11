import { Module } from '@nestjs/common';
import { JwtTokenService } from 'token/jwt-token-service';
import { TOKEN_SERVICE } from 'token/token-service';
import { ConfigModule } from 'config';

/**
 * Token Module
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
  ],
  exports: [TOKEN_SERVICE],
})
export class TokenModule {}
