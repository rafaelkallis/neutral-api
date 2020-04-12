import { Module } from '@nestjs/common';
import { UserModule } from 'user/UserModule';
import { AuthController } from 'auth/presentation/AuthController';
import { AuthService } from 'auth/application/AuthApplicationService';
import { SharedModule } from 'shared/SharedModule';
import { RequestLoginCommandHandler } from 'auth/application/commands/RequestLogin';
import { SubmitLoginCommandHandler } from 'auth/application/commands/SubmitLogin';
import { RequestSignupCommandHandler } from 'auth/application/commands/RequestSignup';
import { SubmitSignupCommandHandler } from 'auth/application/commands/SubmitSignup';
import { RefreshCommandHandler } from 'auth/application/commands/Refresh';

/**
 * Auth Module
 */
@Module({
  imports: [SharedModule, UserModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    RequestLoginCommandHandler,
    SubmitLoginCommandHandler,
    RequestSignupCommandHandler,
    SubmitSignupCommandHandler,
    RefreshCommandHandler,
  ],
})
export class AuthModule {}
