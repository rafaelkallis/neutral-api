import { Type, Injectable } from '@nestjs/common';
import {
  Project,
  CreateProjectOptions,
  ReadonlyProject,
} from 'project/domain/project/Project';
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
  protected async doHandle(
    command: CreateProjectCommand,
  ): Promise<ReadonlyProject> {
    const createProjectOptions: CreateProjectOptions = {
      title: ProjectTitle.from(command.title),
      description: ProjectDescription.from(command.description),
      creator: command.authUser,
    };
    if (command.skipManagerReview) {
      createProjectOptions.skipManagerReview = SkipManagerReview.from(
        command.skipManagerReview,
      );
    }
    if (command.contributionVisibility) {
      createProjectOptions.contributionVisibility = ContributionVisibility.from(
        command.contributionVisibility,
      );
    }
    return Project.create(createProjectOptions);
  }

  public getCommandType(): Type<CreateProjectCommand> {
    return CreateProjectCommand;
  }
}
