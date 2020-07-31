import { Project, UpdateProjectContext } from 'project/domain/project/Project';
import {
  ProjectCommand,
  ProjectCommandHandler,
} from 'project/application/commands/ProjectCommand';
import { User } from 'user/domain/User';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';
import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'shared/command/CommandHandler';

export class UpdateProjectCommand extends ProjectCommand {
  public readonly projectId: ProjectId;
  public readonly updateProjectContext: UpdateProjectContext;

  public constructor(
    authUser: User,
    projectId: ProjectId,
    updateProjectContext: UpdateProjectContext,
  ) {
    super(authUser);
    this.projectId = projectId;
    this.updateProjectContext = updateProjectContext;
  }
}

@Injectable()
@CommandHandler.register(UpdateProjectCommand)
export class UpdateProjectCommandHandler extends ProjectCommandHandler<
  UpdateProjectCommand
> {
  protected async doHandle(command: UpdateProjectCommand): Promise<Project> {
    const project = await this.projectRepository.findById(command.projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(command.authUser);
    project.update(command.updateProjectContext);
    return project;
  }
}
