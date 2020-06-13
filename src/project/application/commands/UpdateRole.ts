import { ReadonlyProject } from 'project/domain/project/Project';
import {
  ProjectCommand,
  ProjectCommandHandler,
} from 'project/application/commands/ProjectCommand';
import { User } from 'user/domain/User';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'shared/command/CommandHandler';

export class UpdateRoleCommand extends ProjectCommand {
  public readonly projectId: string;
  public readonly roleId: string;
  public readonly title?: string;
  public readonly description?: string;

  public constructor(
    authUser: User,
    projectId: string,
    roleId: string,
    title?: string,
    description?: string,
  ) {
    super(authUser);
    this.projectId = projectId;
    this.roleId = roleId;
    this.title = title;
    this.description = description;
  }
}

@Injectable()
@CommandHandler.ofCommand(UpdateRoleCommand)
export class UpdateRoleCommandHandler extends ProjectCommandHandler<
  UpdateRoleCommand
> {
  protected async doHandle(
    command: UpdateRoleCommand,
  ): Promise<ReadonlyProject> {
    const projectId = ProjectId.from(command.projectId);
    const roleId = RoleId.from(command.roleId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(command.authUser);
    const title = command.title ? RoleTitle.from(command.title) : undefined;
    const description = command.description
      ? RoleDescription.from(command.description)
      : undefined;
    project.updateRole(roleId, title, description);
    return project;
  }
}
