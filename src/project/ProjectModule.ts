import { Module } from '@nestjs/common';

import { UserModule } from 'user/UserModule';

import { ProjectController } from 'project/presentation/ProjectController';
import { ProjectApplicationService } from 'project/application/ProjectApplicationService';
import { PROJECT_REPOSITORY } from 'project/domain/ProjectRepository';

import { ProjectTypeOrmRepository } from 'project/infrastructure/ProjectTypeOrmRepository';
import { EventModule } from 'event/EventModule';
import { DatabaseModule } from 'database/DatabaseModule';
import { TokenModule } from 'token/TokenModule';
import { ProjectTypeOrmEntityMapperService } from 'project/infrastructure/ProjectTypeOrmEntityMapperService';
import { RoleController } from 'project/presentation/RoleController';
import { CONSENSUALITY_COMPUTER } from 'project/domain/ConsensualityComputer';
import { CONTRIBUTIONS_COMPUTER } from 'project/domain/ContributionsComputer';
import { CoveeContributionsComputerService } from 'project/infrastructure/CoveeContributionsComputerService';
import { MeanDeviationConsensualityComputerService } from 'project/infrastructure/MeanDeviationConsensualityComputer';

/**
 * Project Module
 */
@Module({
  imports: [EventModule, DatabaseModule, TokenModule, UserModule],
  controllers: [ProjectController, RoleController],
  providers: [
    {
      provide: PROJECT_REPOSITORY,
      useClass: ProjectTypeOrmRepository,
    },
    {
      provide: CONSENSUALITY_COMPUTER,
      useClass: MeanDeviationConsensualityComputerService,
    },
    {
      provide: CONTRIBUTIONS_COMPUTER,
      useClass: CoveeContributionsComputerService,
    },
    ProjectApplicationService,
    ProjectTypeOrmEntityMapperService,
  ],
  exports: [PROJECT_REPOSITORY],
})
export class ProjectModule {}
