import { Module } from '@nestjs/common';
import { UserModule } from 'user/UserModule';
import { ProjectController } from 'project/presentation/ProjectController';
import { ProjectApplicationService } from 'project/application/ProjectApplicationService';
import { PROJECT_REPOSITORY } from 'project/domain/ProjectRepository';
import { ProjectTypeOrmRepository } from 'project/infrastructure/ProjectTypeOrmRepository';
import { ProjectTypeOrmEntityMapperService } from 'project/infrastructure/ProjectTypeOrmEntityMapperService';
import { RoleController } from 'project/presentation/RoleController';
import { CoveeContributionsComputerService } from 'project/infrastructure/CoveeContributionsComputerService';
import { MeanDeviationConsensualityComputerService } from 'project/infrastructure/MeanDeviationConsensualityComputer';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { SharedModule } from 'shared/SharedModule';

/**
 * Project Module
 */
@Module({
  imports: [SharedModule, UserModule],
  controllers: [ProjectController, RoleController],
  providers: [
    {
      provide: PROJECT_REPOSITORY,
      useClass: ProjectTypeOrmRepository,
    },
    {
      provide: ConsensualityComputer,
      useClass: MeanDeviationConsensualityComputerService,
    },
    {
      provide: ContributionsComputer,
      useClass: CoveeContributionsComputerService,
    },
    ProjectApplicationService,
    ProjectTypeOrmEntityMapperService,
  ],
  exports: [PROJECT_REPOSITORY],
})
export class ProjectModule {}
