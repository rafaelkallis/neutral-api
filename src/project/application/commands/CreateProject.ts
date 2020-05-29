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
import { CommandHandler } from 'shared/command/CommandHandler';

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

@CommandHandler(CreateProjectCommand)
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

  protected doHandle(command: CreateProjectCommand): ReadonlyProject {
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
}
