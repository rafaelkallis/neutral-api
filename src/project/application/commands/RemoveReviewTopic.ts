import { ReadonlyProject } from 'project/domain/project/Project';
import {
  ProjectCommand,
  ProjectCommandHandler,
} from 'project/application/commands/ProjectCommand';
import { User } from 'user/domain/User';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'shared/command/CommandHandler';

export class RemoveReviewTopicCommand extends ProjectCommand {
  public readonly projectId: string;
  public readonly reviewTopicId: string;

  public constructor(authUser: User, projectId: string, reviewTopicId: string) {
    super(authUser);
    this.projectId = projectId;
    this.reviewTopicId = reviewTopicId;
  }
}

@Injectable()
@CommandHandler.ofCommand(RemoveReviewTopicCommand)
export class RemoveReviewTopicCommandHandler extends ProjectCommandHandler<
  RemoveReviewTopicCommand
> {
  protected async doHandle(
    command: RemoveReviewTopicCommand,
  ): Promise<ReadonlyProject> {
    const projectId = ProjectId.from(command.projectId);
    const reviewTopicId = ReviewTopicId.from(command.reviewTopicId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(command.authUser);
    project.removeReviewTopic(reviewTopicId);
    return project;
  }
}
