import { Module } from '@nestjs/common';

import { CommonModule } from '../common';

import { ProjectController } from './project.controller';

@Module({
  imports: [CommonModule],
  controllers: [ProjectController],
})
export class ProjectModule {}
