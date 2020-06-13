import { ReadonlyProject } from 'project/domain/project/Project';
import {
  ProjectCommand,
  ProjectCommandHandler,
} from 'project/application/commands/ProjectCommand';
import { User } from 'user/domain/User';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/review-topic/value-objects/ReviewTopicDescription';
import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'shared/command/CommandHandler';

export class AddReviewTopicCommand extends ProjectCommand {
  public readonly projectId: string;
  public readonly title: string;
  public readonly description: string;

  public constructor(
    authUser: User,
    projectId: string,
    title: string,
    description: string,
  ) {
    super(authUser);
    this.projectId = projectId;
    this.title = title;
    this.description = description;
  }
}

@Injectable()
@CommandHandler.ofCommand(AddReviewTopicCommand)
export class AddReviewTopicCommandHandler extends ProjectCommandHandler<
  AddReviewTopicCommand
> {
  protected async doHandle(
    command: AddReviewTopicCommand,
  ): Promise<ReadonlyProject> {
    const projectId = ProjectId.from(command.projectId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(command.authUser);
    const title = ReviewTopicTitle.from(command.title);
    const description = ReviewTopicDescription.from(command.description);
    project.addReviewTopic(title, description);
    return project;
  }
}
