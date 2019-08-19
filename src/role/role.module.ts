import { Module } from '@nestjs/common';

import { CommonModule } from '../common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';

/**
 * Role Module
 */
@Module({
  imports: [CommonModule],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
