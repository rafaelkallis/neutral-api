import { Module } from '@nestjs/common';
import { UserModule } from 'user/UserModule';
import { ProjectController } from 'project/presentation/ProjectController';
import { ProjectApplicationService } from 'project/application/ProjectApplicationService';
import { TypeOrmProjectRepository } from 'project/infrastructure/TypeOrmProjectRepository';
import { RoleController } from 'project/presentation/RoleController';
import { ReviewTopicController } from 'project/presentation/ReviewTopicController';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { SharedModule } from 'shared/SharedModule';
import {
  ProjectTypeOrmEntityMap,
  ReverseProjectTypeOrmEntityMap,
} from 'project/infrastructure/ProjectTypeOrmEntityMap';
import { ProjectDtoMap } from 'project/application/ProjectDtoMap';
import { RoleDtoMap } from 'project/application/RoleDtoMap';
import { PeerReviewDtoMap } from 'project/application/PeerReviewDtoMap';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { CreateProjectCommandHandler } from 'project/application/commands/CreateProject';
import { UpdateProjectCommandHandler } from 'project/application/commands/UpdateProject';
import { AddRoleCommandHandler } from 'project/application/commands/AddRole';
import {
  ReviewTopicTypeOrmEntityMap,
  ReverseReviewTopicTypeOrmEntityMap,
} from 'project/infrastructure/ReviewTopicTypeOrmEntityMap';
import {
  RoleTypeOrmEntityMap,
  ReverseRoleTypeOrmEntityMap,
} from 'project/infrastructure/RoleTypeOrmEntityMap';
import {
  PeerReviewTypeOrmEntityMap,
  ReversePeerReviewTypeOrmEntityMap,
} from 'project/infrastructure/PeerReviewTypeOrmEntityMap';
import { ProjectFactory } from 'project/application/ProjectFactory';
import { UpdateRoleCommandHandler } from 'project/application/commands/UpdateRole';
import {
  MilestoneTypeOrmEntityMap,
  ReverseMilestoneTypeOrmEntityMap,
} from 'project/infrastructure/MilestoneTypeOrmEntityMap';
import { AddReviewTopicCommandHandler } from 'project/application/commands/AddReviewTopic';
import { ReviewTopicDtoMap } from 'project/application/ReviewTopicDtoMap';
import { UpdateReviewTopicCommandHandler } from 'project/application/commands/UpdateReviewTopic';
import { RemoveReviewTopicCommandHandler } from 'project/application/commands/RemoveReviewTopic';
import { RemoveRoleCommandHandler } from 'project/application/commands/RemoveRole';
import { UnassignRoleCommandHandler } from 'project/application/commands/UnassignRole';
import { ProjectDomainEventHandlers } from 'project/application/ProjectDomainEventHandlers';
import { AssignRoleCommandHandler } from 'project/application/commands/AssignRole';
import { SubmitPeerReviewsCommandHandler } from 'project/application/commands/SubmitPeerReviews';
import { CompletePeerReviewsCommandHandler } from 'project/application/commands/CompletePeerReviews';
import { StaticConsensualityComputer } from './infrastructure/StaticConsensualityComputer';
import { MilestoneController } from './presentation/MilestoneController';
import { AddMilestoneCommandHandler } from './application/commands/AddMilestone';
import { CancelLatestMilestoneCommandHandler } from './application/commands/CancelLatestMilestone';
import { MilestoneDtoMap } from './application/MilestoneDtoMap';
import { ProjectAnalyzer } from './domain/ProjectAnalyzer';
import { CoveeKernelProjectAnalyzer } from './infrastructure/CoveeKernelProjectAnalyzer';
import {
  ReverseRoleMetricTypeOrmEntityMap,
  RoleMetricTypeOrmEntityMap,
} from './infrastructure/RoleMetricTypeOrmEntityMap';
import { RoleMetricDtoMap } from './application/RoleMetricDtoMap';
import { MilestoneMetricDtoMap } from './application/MilestoneMetricDtoMap';
import {
  MilestoneMetricTypeOrmEntityMap,
  ReverseMilestoneMetricTypeOrmEntityMap,
} from './infrastructure/MilestoneMetricTypeOrmEntityMap';

/**
 * Project Module
 */
@Module({
  imports: [SharedModule, UserModule],
  controllers: [
    ProjectController,
    RoleController,
    ReviewTopicController,
    MilestoneController,
  ],
  providers: [
    {
      provide: ProjectRepository,
      useClass: TypeOrmProjectRepository,
    },
    {
      provide: ConsensualityComputer,
      useClass: StaticConsensualityComputer,
    },
    {
      provide: ProjectAnalyzer,
      useClass: CoveeKernelProjectAnalyzer,
    },
    ProjectApplicationService,
    ProjectFactory,
    ProjectDomainEventHandlers,
    // maps
    ProjectDtoMap,
    RoleDtoMap,
    PeerReviewDtoMap,
    ReviewTopicDtoMap,
    MilestoneDtoMap,
    RoleMetricDtoMap,
    MilestoneMetricDtoMap,
    ProjectTypeOrmEntityMap,
    ReverseProjectTypeOrmEntityMap,
    RoleTypeOrmEntityMap,
    ReverseRoleTypeOrmEntityMap,
    PeerReviewTypeOrmEntityMap,
    ReversePeerReviewTypeOrmEntityMap,
    ReviewTopicTypeOrmEntityMap,
    ReverseReviewTopicTypeOrmEntityMap,
    MilestoneTypeOrmEntityMap,
    ReverseMilestoneTypeOrmEntityMap,
    RoleMetricTypeOrmEntityMap,
    ReverseRoleMetricTypeOrmEntityMap,
    MilestoneMetricTypeOrmEntityMap,
    ReverseMilestoneMetricTypeOrmEntityMap,
    // command handlers
    CreateProjectCommandHandler,
    UpdateProjectCommandHandler,
    AddRoleCommandHandler,
    UpdateRoleCommandHandler,
    AddReviewTopicCommandHandler,
    UpdateReviewTopicCommandHandler,
    RemoveReviewTopicCommandHandler,
    RemoveRoleCommandHandler,
    AssignRoleCommandHandler,
    UnassignRoleCommandHandler,
    SubmitPeerReviewsCommandHandler,
    CompletePeerReviewsCommandHandler,
    AddMilestoneCommandHandler,
    CancelLatestMilestoneCommandHandler,
  ],
  exports: [ProjectRepository],
})
export class ProjectModule {}
