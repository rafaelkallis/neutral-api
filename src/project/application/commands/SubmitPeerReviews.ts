import { Project } from 'project/domain/project/Project';
import {
  ProjectCommand,
  ProjectCommandHandler,
} from 'project/application/commands/ProjectCommand';
import { User } from 'user/domain/User';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';
import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'shared/command/CommandHandler';
import { SubmitPeerReviewsDto } from '../dto/SubmitPeerReviewsDto';
import { InsufficientPermissionsException } from 'shared/exceptions/insufficient-permissions.exception';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';

export class SubmitPeerReviewsCommand extends ProjectCommand {
  public readonly projectId: string;
  public readonly submitPeerReviewsDto: SubmitPeerReviewsDto;

  public constructor(
    authUser: User,
    projectId: string,
    submitPeerReviewsDto: SubmitPeerReviewsDto,
  ) {
    super(authUser);
    this.projectId = projectId;
    this.submitPeerReviewsDto = submitPeerReviewsDto;
  }
}

@Injectable()
@CommandHandler.register(SubmitPeerReviewsCommand)
export class SubmitPeerReviewsCommandHandler extends ProjectCommandHandler<SubmitPeerReviewsCommand> {
  private readonly contributionsComputer: ContributionsComputer;
  private readonly consensualityComputer: ConsensualityComputer;

  public constructor(
    objectMapper: ObjectMapper,
    projectRepository: ProjectRepository,
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ) {
    super(objectMapper, projectRepository);
    this.contributionsComputer = contributionsComputer;
    this.consensualityComputer = consensualityComputer;
  }

  protected async doHandle(
    command: SubmitPeerReviewsCommand,
  ): Promise<Project> {
    const projectId = ProjectId.from(command.projectId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    if (!project.roles.isAnyAssignedToUser(command.authUser)) {
      throw new InsufficientPermissionsException();
    }
    const authRole = project.roles.whereAssignee(command.authUser);
    const submittedPeerReviews = command.submitPeerReviewsDto.asPeerReviewCollection(
      authRole.id,
      project.milestones.whereLatest(),
    );
    await project.submitPeerReviews(
      submittedPeerReviews,
      this.contributionsComputer,
      this.consensualityComputer,
    );
    return project;
  }
}
