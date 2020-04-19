import { Inject } from '@nestjs/common';
import { AuthenticatedCommand } from 'shared/command/Command';
import { CommandHandler } from 'shared/command/CommandHandler';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import { Project } from 'project/domain/Project';

export abstract class ProjectCommand extends AuthenticatedCommand<ProjectDto> {}

export abstract class ProjectCommandHandler<
  TCommand extends ProjectCommand
> extends CommandHandler<ProjectDto, TCommand> {
  @Inject() protected readonly objectMapper!: ObjectMapper;
  @Inject() protected readonly projectRepository!: ProjectRepository;

  public async handle(command: TCommand): Promise<ProjectDto> {
    const project = await this.doHandle(command);
    await this.projectRepository.persist(project);
    return this.objectMapper.map(project, ProjectDto, {
      authUser: command.authUser,
    });
  }

  protected abstract doHandle(command: TCommand): Promise<Project>;
}
