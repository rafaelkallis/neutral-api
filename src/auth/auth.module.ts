import { Module } from '@nestjs/common';

import { CommonModule } from '../common';

import { AuthController } from './auth.controller';

/**
 * Auth Module
 */
@Module({
  imports: [CommonModule],
  controllers: [AuthController],
})
export class AuthModule {}
