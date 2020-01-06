import { Module } from '@nestjs/common';
import { CommonModule } from 'common/common.module';
import { UserModule } from 'user/user.module';
import { AuthController } from 'auth/auth.controller';
import { AuthService } from 'auth/services/auth.service';
import { ConfigModule } from 'config';
import { EmailModule } from 'email';
import { TokenModule } from 'token';

/**
 * Auth Module
 */
@Module({
  imports: [ConfigModule, EmailModule, CommonModule, TokenModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
