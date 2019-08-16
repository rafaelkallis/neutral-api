import { Module } from '@nestjs/common';

import { CommonModule } from '../common';

import { ProjectController } from './project.controller';

import { ModelService } from './services/model.service';

/**
 * Project Module
 */
@Module({
  imports: [CommonModule],
  controllers: [ProjectController],
  providers: [ModelService],
})
export class ProjectModule {}
