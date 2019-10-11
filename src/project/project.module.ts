import { Module } from '@nestjs/common';

import { CommonModule } from '../common';

import { ProjectController } from './project.controller';

import { ProjectService } from './project.service';

/**
 * Project Module
 */
@Module({
  imports: [CommonModule],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
