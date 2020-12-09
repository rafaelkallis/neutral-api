import { Module } from '@nestjs/common';
import { UserModule } from 'user/UserModule';
import { AuthController } from 'auth/presentation/AuthController';
import { SharedModule } from 'shared/SharedModule';
import { RequestLoginCommandHandler } from 'auth/application/commands/RequestLogin';
import { SubmitLoginCommandHandler } from 'auth/application/commands/SubmitLogin';
import { RefreshCommandHandler } from 'auth/application/commands/Refresh';
import { AuthDomainEventHandlers } from 'auth/application/AuthDomainEventHandlers';

/**
 * Auth Module
 */
@Module({
  imports: [SharedModule, UserModule],
  controllers: [AuthController],
  providers: [
    AuthDomainEventHandlers,
    // commands
    RequestLoginCommandHandler,
    SubmitLoginCommandHandler,
    RefreshCommandHandler,
  ],
})
export class AuthModule {}
