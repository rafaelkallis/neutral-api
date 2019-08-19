import { Module } from '@nestjs/common';

import { CommonModule } from '../common';

import { ProjectController } from './project.controller';

import { ProjectService } from './project.service';
import { ModelService } from './services/model.service';
import { ProjectStateTransitionValidationService } from './services/project-state-transition-validation.service';

/**
 * Project Module
 */
@Module({
  imports: [CommonModule],
  controllers: [ProjectController],
  providers: [
    ProjectService,
    ModelService,
    ProjectStateTransitionValidationService,
  ],
})
export class ProjectModule {}
