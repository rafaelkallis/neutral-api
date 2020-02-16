import { Module } from '@nestjs/common';

import { UserModule } from 'user/UserModule';
import { RoleModule } from 'role/RoleModule';

import { ProjectController } from 'project/presentation/ProjectController';
import { ProjectApplicationService } from 'project/application/ProjectApplicationService';
import { ProjectDomainService } from 'project/domain/ProjectDomainService';
import { ContributionsModelService } from 'project/domain/ContributionsModelService';
import { ConsensualityModelService } from 'project/domain/ConsensualityModelService';
import { PROJECT_REPOSITORY } from 'project/domain/ProjectRepository';

import { ProjectTypeOrmRepository } from 'project/infrastructure/ProjectTypeOrmRepository';
import { EventModule } from 'event';
import { DatabaseModule } from 'database';
import { TokenModule } from 'token';
import { ProjectTypeOrmEntityMapperService } from 'project/infrastructure/ProjectTypeOrmEntityMapperService';
import { PeerReviewModelFactoryService } from 'role/domain/PeerReviewModelFactoryService';
import { RoleController } from 'project/presentation/RoleController';

/**
 * Project Module
 */
@Module({
  imports: [EventModule, DatabaseModule, TokenModule, UserModule, RoleModule],
  controllers: [ProjectController, RoleController],
  providers: [
    ProjectDomainService,
    PeerReviewModelFactoryService,
    {
      provide: PROJECT_REPOSITORY,
      useClass: ProjectTypeOrmRepository,
    },
    ProjectApplicationService,
    ContributionsModelService,
    ConsensualityModelService,
    ProjectTypeOrmEntityMapperService,
  ],
  exports: [PROJECT_REPOSITORY],
})
export class ProjectModule {}
