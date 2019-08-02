import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { CommonModule } from '../common';

@Module({
  imports: [CommonModule],
  controllers: [UserController],
})
export class UserModule {}
