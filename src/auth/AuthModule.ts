import { Module } from '@nestjs/common';
import { UserModule } from 'user/UserModule';
import { AuthController } from 'auth/presentation/AuthController';
import { AuthService } from 'auth/application/AuthApplicationService';
import { SharedModule } from 'shared/SharedModule';

/**
 * Auth Module
 */
@Module({
  imports: [SharedModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
