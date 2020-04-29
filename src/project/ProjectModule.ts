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
import { UpdateProjectCommandHandler } from 'project/application/commands/UpdateProject';
import { AddRoleCommandHandler } from 'project/application/commands/AddRole';
import { ReviewTopicTypeOrmEntityMap } from 'project/infrastructure/ReviewTopicTypeOrmEntityMap';

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
    ReviewTopicTypeOrmEntityMap,
    ReverseProjectTypeOrmEntityMap,
    CreateProjectCommandHandler,
    UpdateProjectCommandHandler,
    AddRoleCommandHandler,
  ],
  exports: [ProjectRepository],
})
export class ProjectModule {}
