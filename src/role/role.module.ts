import { Module } from '@nestjs/common';

import { CommonModule } from '../common';

import { RoleController } from './role.controller';

@Module({
  imports: [CommonModule],
  controllers: [RoleController],
})
export class RoleModule {}
