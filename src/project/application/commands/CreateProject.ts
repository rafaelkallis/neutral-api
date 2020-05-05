import { Type, Injectable } from '@nestjs/common';
import { ReadonlyProject } from 'project/domain/project/Project';
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

export class CreateProjectCommand extends ProjectCommand {
  public readonly title: string;
  public readonly description: string;
  public readonly contributionVisibility?: ContributionVisibilityValue;
  public readonly skipManagerReview?: SkipManagerReviewValue;

  public constructor(
    authUser: User,
    title: string,
    description: string,
    contributionVisibility?: ContributionVisibilityValue,
    skipManagerReview?: SkipManagerReviewValue,
  ) {
    super(authUser);
    this.title = title;
    this.description = description;
    this.contributionVisibility = contributionVisibility;
    this.skipManagerReview = skipManagerReview;
  }
}

@Injectable()
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

  protected async doHandle(
    command: CreateProjectCommand,
  ): Promise<ReadonlyProject> {
    return this.projectFactory.create({
      title: ProjectTitle.from(command.title),
      description: ProjectDescription.from(command.description),
      creator: command.authUser,
      contributionVisibility: command.contributionVisibility
        ? ContributionVisibility.from(command.contributionVisibility)
        : undefined,
      skipManagerReview: command.skipManagerReview
        ? SkipManagerReview.from(command.skipManagerReview)
        : undefined,
    });
  }

  public getCommandType(): Type<CreateProjectCommand> {
    return CreateProjectCommand;
  }
}
