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
import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'shared/command/CommandHandler';
import { Either } from 'shared/domain/Either';
import { UserId } from 'user/domain/value-objects/UserId';
import { Email } from 'user/domain/value-objects/Email';

export class AddRoleCommand extends ProjectCommand {
  public readonly projectId: string;
  public readonly title: string;
  public readonly description: string;
  public readonly assignee?: Either<UserId, Email>;

  public constructor(
    authUser: User,
    projectId: string,
    title: string,
    description: string,
    assignee?: Either<UserId, Email>,
  ) {
    super(authUser);
    this.projectId = projectId;
    this.title = title;
    this.description = description;
    this.assignee = assignee;
  }
}

@Injectable()
@CommandHandler.register(AddRoleCommand)
export class AddRoleCommandHandler extends ProjectCommandHandler<
  AddRoleCommand
> {
  protected async doHandle(command: AddRoleCommand): Promise<ReadonlyProject> {
    const projectId = ProjectId.from(command.projectId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(command.authUser);
    const title = RoleTitle.from(command.title);
    const description = RoleDescription.from(command.description);
    project.addRole(title, description);
    return project;
  }
}
