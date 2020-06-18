import { ReadonlyProject } from 'project/domain/project/Project';
import {
  ProjectCommand,
  ProjectCommandHandler,
} from 'project/application/commands/ProjectCommand';
import { User } from 'user/domain/User';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { Injectable } from '@nestjs/common';
import { UserId } from 'user/domain/value-objects/UserId';
import { Email } from 'user/domain/value-objects/Email';
import { Either } from 'shared/domain/Either';
import { UserRepository } from 'user/domain/UserRepository';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { UserFactory } from 'user/application/UserFactory';
import { UserNotFoundException } from 'user/application/exceptions/UserNotFoundException';
import { CommandHandler } from 'shared/command/CommandHandler';

export class AssignRoleCommand extends ProjectCommand {
  public readonly projectId: ProjectId;
  public readonly roleId: RoleId;
  public readonly assignee: Either<UserId, Email>;

  public constructor(
    authUser: User,
    projectId: ProjectId,
    roleId: RoleId,
    assignee: Either<UserId, Email>,
  ) {
    super(authUser);
    this.projectId = projectId;
    this.roleId = roleId;
    this.assignee = assignee;
  }
}

@Injectable()
@CommandHandler.register(AssignRoleCommand)
export class AssignRoleCommandHandler extends ProjectCommandHandler<
  AssignRoleCommand
> {
  private readonly userRepository: UserRepository;
  private readonly userFactory: UserFactory;

  public constructor(
    objectMapper: ObjectMapper,
    projectRepository: ProjectRepository,
    userRepository: UserRepository,
    userFactory: UserFactory,
  ) {
    super(objectMapper, projectRepository);
    this.userRepository = userRepository;
    this.userFactory = userFactory;
  }

  protected async doHandle(
    command: AssignRoleCommand,
  ): Promise<ReadonlyProject> {
    const project = await this.projectRepository.findById(command.projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(command.authUser);
    const roleToAssign = project.roles.whereId(command.roleId);
    const userToAssign = await command.assignee.fold(
      async (userId) => {
        const user = await this.userRepository.findById(userId);
        if (!user) {
          throw new UserNotFoundException();
        }
        return user;
      },
      async (email) => {
        let user = await this.userRepository.findByEmail(email);
        if (!user) {
          user = this.userFactory.create({ email });
          await this.userRepository.persist(user);
        }
        return user;
      },
    );
    project.assignUserToRole(userToAssign, roleToAssign.id);
    return project;
  }
}
