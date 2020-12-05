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
import { MilestoneTitle } from 'project/domain/milestone/value-objects/MilestoneTitle';
import { MilestoneDescription } from 'project/domain/milestone/value-objects/MilestoneDescription';

export class AddMilestoneCommand extends ProjectCommand {
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
@CommandHandler.register(AddMilestoneCommand)
export class AddMilestoneCommandHandler extends ProjectCommandHandler<AddMilestoneCommand> {
  protected async doHandle(command: AddMilestoneCommand): Promise<Project> {
    const projectId = ProjectId.from(command.projectId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(command.authUser);
    const title = MilestoneTitle.from(command.title);
    const description = MilestoneDescription.from(command.description);
    project.addMilestone(title, description);
    return project;
  }
}
