import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CommonModule } from '../common';

@Module({
  imports: [CommonModule],
  controllers: [AuthController],
})
export class AuthModule {}
