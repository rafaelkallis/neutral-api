import { Module } from '@nestjs/common';

import { UserModule } from 'user/user.module';
import { RoleModule } from 'role/role.module';

import { ProjectController } from 'project/project.controller';
import { ProjectApplicationService } from 'project/services/project.service';
import { ContributionsModelService } from 'project/services/contributions-model.service';
import { ConsensualityModelService } from 'project/services/consensuality-model.service';
import { PROJECT_REPOSITORY } from 'project/repositories/project.repository';

import { ProjectDomainService } from 'project/services/project.domain-service';
import { TypeOrmProjectRepository } from 'project/repositories/typeorm-project.repository';
import { EventModule } from 'event';
import { DatabaseModule } from 'database';
import { CommonModule } from 'common/common.module';

/**
 * Project Module
 */
@Module({
  imports: [EventModule, DatabaseModule, CommonModule, UserModule, RoleModule],
  controllers: [ProjectController],
  providers: [
    {
      provide: PROJECT_REPOSITORY,
      useClass: TypeOrmProjectRepository,
    },
    ProjectApplicationService,
    ProjectDomainService,
    ContributionsModelService,
    ConsensualityModelService,
  ],
  exports: [PROJECT_REPOSITORY],
})
export class ProjectModule {}
