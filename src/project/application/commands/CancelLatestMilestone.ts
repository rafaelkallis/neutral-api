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

export class CancelLatestMilestoneCommand extends ProjectCommand {
  public readonly projectId: string;

  public constructor(authUser: User, projectId: string) {
    super(authUser);
    this.projectId = projectId;
  }
}

@Injectable()
@CommandHandler.register(CancelLatestMilestoneCommand)
export class CancelLatestMilestoneCommandHandler extends ProjectCommandHandler<CancelLatestMilestoneCommand> {
  protected async doHandle(
    command: CancelLatestMilestoneCommand,
  ): Promise<Project> {
    const projectId = ProjectId.from(command.projectId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(command.authUser);
    project.latestMilestone.cancel();
    return project;
  }
}
