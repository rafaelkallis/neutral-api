import { Module } from '@nestjs/common';
import { UserModule } from 'user/UserModule';
import { ProjectController } from 'project/presentation/ProjectController';
import { ProjectApplicationService } from 'project/application/ProjectApplicationService';
import { TypeOrmProjectRepository } from 'project/infrastructure/TypeOrmProjectRepository';
import { RoleController } from 'project/presentation/RoleController';
import { CoveeContributionsComputerService } from 'project/infrastructure/CoveeContributionsComputerService';
import { MeanDeviationConsensualityComputerService } from 'project/infrastructure/MeanDeviationConsensualityComputer';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { SharedModule } from 'shared/SharedModule';
import {
  ProjectTypeOrmEntityMap,
  ReverseProjectTypeOrmEntityMap,
} from 'project/infrastructure/ProjectTypeOrmEntityMap';
import { ProjectDtoMap } from 'project/application/ProjectDtoMap';
import { RoleDtoMap } from 'project/application/RoleDtoMap';
import { PeerReviewDtoMap } from 'project/application/PeerReviewDtoMap';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import { CreateProjectCommandHandler } from 'project/application/commands/CreateProject';
import { UpdateProjectCommandHandler } from './application/commands/UpdateProject';

/**
 * Project Module
 */
@Module({
  imports: [SharedModule, UserModule],
  controllers: [ProjectController, RoleController],
  providers: [
    {
      provide: ProjectRepository,
      useClass: TypeOrmProjectRepository,
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
    ProjectDtoMap,
    RoleDtoMap,
    PeerReviewDtoMap,
    ProjectTypeOrmEntityMap,
    ReverseProjectTypeOrmEntityMap,
    CreateProjectCommandHandler,
    UpdateProjectCommandHandler,
  ],
  exports: [ProjectRepository],
})
export class ProjectModule {}
