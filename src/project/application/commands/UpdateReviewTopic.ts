import { ReadonlyProject } from 'project/domain/project/Project';
import {
  ProjectCommand,
  ProjectCommandHandler,
} from 'project/application/commands/ProjectCommand';
import { User } from 'user/domain/User';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/review-topic/value-objects/ReviewTopicDescription';
import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'shared/command/CommandHandler';
import { ReviewTopicInput } from 'project/domain/review-topic/ReviewTopicInput';

export class UpdateReviewTopicCommand extends ProjectCommand {
  public readonly projectId: string;
  public readonly reviewTopicId: string;
  public readonly title?: string;
  public readonly description?: string;
  public readonly input?: ReviewTopicInput;

  public constructor(
    authUser: User,
    projectId: string,
    reviewTopicId: string,
    title?: string,
    description?: string,
    input?: ReviewTopicInput,
  ) {
    super(authUser);
    this.projectId = projectId;
    this.reviewTopicId = reviewTopicId;
    this.title = title;
    this.description = description;
    this.input = input;
  }
}

@Injectable()
@CommandHandler.register(UpdateReviewTopicCommand)
export class UpdateReviewTopicCommandHandler extends ProjectCommandHandler<
  UpdateReviewTopicCommand
> {
  protected async doHandle(
    command: UpdateReviewTopicCommand,
  ): Promise<ReadonlyProject> {
    const projectId = ProjectId.from(command.projectId);
    const reviewTopicId = ReviewTopicId.from(command.reviewTopicId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(command.authUser);
    const title = command.title
      ? ReviewTopicTitle.from(command.title)
      : undefined;
    const description = command.description
      ? ReviewTopicDescription.from(command.description)
      : undefined;
    project.updateReviewTopic(reviewTopicId, title, description, command.input);
    return project;
  }
}
