import { Project } from 'project/domain/project/Project';
import {
  ProjectCommand,
  ProjectCommandHandler,
} from 'project/application/commands/ProjectCommand';
import {
  ContributionVisibilityValue,
  ContributionVisibility,
} from 'project/domain/project/value-objects/ContributionVisibility';
import {
  SkipManagerReviewValue,
  SkipManagerReview,
} from 'project/domain/project/value-objects/SkipManagerReview';
import { User } from 'user/domain/User';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/project/value-objects/ProjectDescription';
import { ProjectFactory } from '../ProjectFactory';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'shared/command/CommandHandler';

export class CreateProjectCommand extends ProjectCommand {
  public readonly title: string;
  public readonly description: string;
  public readonly meta?: Record<string, unknown>;
  public readonly contributionVisibility: ContributionVisibilityValue;
  public readonly skipManagerReview: SkipManagerReviewValue;

  public constructor(
    authUser: User,
    title: string,
    description: string,
    meta: Record<string, unknown> | undefined,
    contributionVisibility: ContributionVisibilityValue,
    skipManagerReview: SkipManagerReviewValue,
  ) {
    super(authUser);
    this.title = title;
    this.description = description;
    this.meta = meta;
    this.contributionVisibility = contributionVisibility;
    this.skipManagerReview = skipManagerReview;
  }
}

@Injectable()
@CommandHandler.register(CreateProjectCommand)
export class CreateProjectCommandHandler extends ProjectCommandHandler<
  CreateProjectCommand
> {
  private readonly projectFactory: ProjectFactory;

  public constructor(
    projectFactory: ProjectFactory,
    objectMapper: ObjectMapper,
    projectRepository: ProjectRepository,
  ) {
    super(objectMapper, projectRepository);
    this.projectFactory = projectFactory;
  }

  protected doHandle(command: CreateProjectCommand): Project {
    return this.projectFactory.create({
      title: ProjectTitle.from(command.title),
      description: ProjectDescription.from(command.description),
      meta: command.meta || {},
      creator: command.authUser,
      contributionVisibility: ContributionVisibility.ofValue(
        command.contributionVisibility,
      ),
      skipManagerReview: SkipManagerReview.from(command.skipManagerReview),
    });
  }
}
