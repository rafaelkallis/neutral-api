import { Module } from '@nestjs/common';
import { UserModule } from 'user/user.module';
import { AuthController } from 'auth/auth.controller';
import { AuthService } from 'auth/services/auth.service';
import { ConfigModule } from 'config';
import { EmailModule } from 'email';
import { TokenModule } from 'token';
import { EventModule } from 'event';

/**
 * Auth Module
 */
@Module({
  imports: [ConfigModule, EmailModule, TokenModule, EventModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
