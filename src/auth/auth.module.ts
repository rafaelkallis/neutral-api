import { Module } from '@nestjs/common';
import { CommonModule } from '../common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/**
 * Auth Module
 */
@Module({
  imports: [CommonModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
