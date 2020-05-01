import { Type, Injectable } from '@nestjs/common';
import { ReadonlyProject } from 'project/domain/project/Project';
import {
  ProjectCommand,
  ProjectCommandHandler,
} from 'project/application/commands/ProjectCommand';
import { User } from 'user/domain/User';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/project/value-objects/ProjectDescription';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';

export class UpdateProjectCommand extends ProjectCommand {
  public readonly projectId: string;
  public readonly title?: string;
  public readonly description?: string;

  public constructor(
    authUser: User,
    projectId: string,
    title?: string,
    description?: string,
  ) {
    super(authUser);
    this.projectId = projectId;
    this.title = title;
    this.description = description;
  }
}

@Injectable()
export class UpdateProjectCommandHandler extends ProjectCommandHandler<
  UpdateProjectCommand
> {
  protected async doHandle(
    command: UpdateProjectCommand,
  ): Promise<ReadonlyProject> {
    const projectId = ProjectId.from(command.projectId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(command.authUser);
    const title = command.title ? ProjectTitle.from(command.title) : undefined;
    const description = command.description
      ? ProjectDescription.from(command.description)
      : undefined;
    project.update(title, description);
    return project;
  }

  public getCommandType(): Type<UpdateProjectCommand> {
    return UpdateProjectCommand;
  }
}