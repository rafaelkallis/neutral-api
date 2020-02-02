import { Module } from '@nestjs/common';

import { UserModule } from 'user/UserModule';
import { RoleModule } from 'role/RoleModule';

import { ProjectController } from 'project/ProjectController';
import { ProjectApplicationService } from 'project/application/ProjectApplicationService';
import { ProjectDomainService } from 'project/domain/ProjectDomainService';
import { ContributionsModelService } from 'project/domain/ContributionsModelService';
import { ConsensualityModelService } from 'project/domain/ConsensualityModelService';
import { PROJECT_REPOSITORY } from 'project/domain/ProjectRepository';

import { ProjectTypeOrmRepository } from 'project/infrastructure/ProjectTypeOrmRepository';
import { EventModule } from 'event';
import { DatabaseModule } from 'database';
import { TokenModule } from 'token';
import { ProjectModelFactoryService } from 'project/domain/ProjectModelFactoryService';
import { ProjectTypeOrmEntityMapperService } from 'project/infrastructure/ProjectTypeOrmEntityMapperService';

/**
 * Project Module
 */
@Module({
  imports: [EventModule, DatabaseModule, TokenModule, UserModule, RoleModule],
  controllers: [ProjectController],
  providers: [
    {
      provide: PROJECT_REPOSITORY,
      useClass: ProjectTypeOrmRepository,
    },
    ProjectApplicationService,
    ProjectDomainService,
    ContributionsModelService,
    ConsensualityModelService,
    ProjectTypeOrmEntityMapperService,
    ProjectModelFactoryService,
  ],
  exports: [PROJECT_REPOSITORY],
})
export class ProjectModule {}
