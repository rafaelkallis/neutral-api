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
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';

export class CompletePeerReviewsCommand extends ProjectCommand {
  public readonly projectId: ProjectId;

  public constructor(authUser: User, projectId: ProjectId) {
    super(authUser);
    this.projectId = projectId;
  }
}

@Injectable()
@CommandHandler.register(CompletePeerReviewsCommand)
export class CompletePeerReviewsCommandHandler extends ProjectCommandHandler<
  CompletePeerReviewsCommand
> {
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
    command: CompletePeerReviewsCommand,
  ): Promise<Project> {
    const project = await this.projectRepository.findById(command.projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(command.authUser);
    await project.completePeerReviews(
      this.contributionsComputer,
      this.consensualityComputer,
    );
    return project;
  }
}
