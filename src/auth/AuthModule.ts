import { Module } from '@nestjs/common';
import { UserModule } from 'user/UserModule';
import { AuthController } from 'auth/presentation/AuthController';
import { AuthService } from 'auth/application/AuthApplicationService';
import { ConfigModule } from 'config/ConfigModule';
import { TokenModule } from 'token/TokenModule';
import { EventModule } from 'event/EventModule';

/**
 * Auth Module
 */
@Module({
  imports: [ConfigModule, TokenModule, EventModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
