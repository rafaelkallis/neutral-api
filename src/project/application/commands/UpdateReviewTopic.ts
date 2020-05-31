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
import { AssociatedRequest } from 'shared/mediator/RequestHandler';
import { Injectable } from '@nestjs/common';

export class UpdateReviewTopicCommand extends ProjectCommand {
  public readonly projectId: string;
  public readonly reviewTopicId: string;
  public readonly title?: string;
  public readonly description?: string;

  public constructor(
    authUser: User,
    projectId: string,
    reviewTopicId: string,
    title?: string,
    description?: string,
  ) {
    super(authUser);
    this.projectId = projectId;
    this.reviewTopicId = reviewTopicId;
    this.title = title;
    this.description = description;
  }
}

@Injectable()
@AssociatedRequest.d(UpdateReviewTopicCommand)
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
    project.updateReviewTopic(reviewTopicId, title, description);
    return project;
  }
}
