import { Module } from '@nestjs/common';

import { CommonModule } from '../common';
import { UserService } from './user.service';
import { UserController } from './user.controller';

/**
 * User Module
 */
@Module({
  imports: [CommonModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
