import { Project } from 'project/domain/project/Project';
import {
  ProjectCommand,
  ProjectCommandHandler,
} from 'project/application/commands/ProjectCommand';
import { User } from 'user/domain/User';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'shared/command/CommandHandler';

export class UnassignRoleCommand extends ProjectCommand {
  public readonly projectId: string;
  public readonly roleId: string;

  public constructor(authUser: User, projectId: string, roleId: string) {
    super(authUser);
    this.projectId = projectId;
    this.roleId = roleId;
  }
}

@Injectable()
@CommandHandler.register(UnassignRoleCommand)
export class UnassignRoleCommandHandler extends ProjectCommandHandler<
  UnassignRoleCommand
> {
  protected async doHandle(command: UnassignRoleCommand): Promise<Project> {
    const projectId = ProjectId.from(command.projectId);
    const roleId = RoleId.from(command.roleId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(command.authUser);
    project.unassignRole(roleId);
    return project;
  }
}
