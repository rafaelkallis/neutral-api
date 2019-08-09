import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { CommonModule } from '../common';

@Module({
  imports: [CommonModule],
  controllers: [RoleController],
})
export class RoleModule {}
