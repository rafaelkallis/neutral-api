import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';

/**
 * Auth Module
 */
@Module({
  imports: [CommonModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
