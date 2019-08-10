import { Module } from '@nestjs/common';

import { CommonModule } from '../common';

import { AuthController } from './auth.controller';

@Module({
  imports: [CommonModule],
  controllers: [AuthController],
})
export class AuthModule {}
