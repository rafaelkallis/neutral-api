import { Module } from '@nestjs/common';

import { CommonModule } from '../common';

import { UserController } from './user.controller';

/**
 * User Module
 */
@Module({
  imports: [CommonModule],
  controllers: [UserController],
})
export class UserModule {}
