import { AuthenticatedCommand } from 'shared/command/Command';
import { AbstractCommandHandler } from 'shared/command/CommandHandler';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { ReadonlyProject } from 'project/domain/project/Project';
import { Injectable } from '@nestjs/common';

export abstract class ProjectCommand extends AuthenticatedCommand<ProjectDto> {}

@Injectable()
export abstract class ProjectCommandHandler<
  TCommand extends ProjectCommand
> extends AbstractCommandHandler<ProjectDto, TCommand> {
  protected readonly objectMapper: ObjectMapper;
  protected readonly projectRepository: ProjectRepository;

  public constructor(
    objectMapper: ObjectMapper,
    projectRepository: ProjectRepository,
  ) {
    super();
    this.objectMapper = objectMapper;
    this.projectRepository = projectRepository;
  }

  public async handle(command: TCommand): Promise<ProjectDto> {
    const project = await this.doHandle(command);
    await this.projectRepository.persist(project);
    return this.objectMapper.map(project, ProjectDto, {
      authUser: command.authUser,
    });
  }

  protected abstract doHandle(
    command: TCommand,
  ): ReadonlyProject | Promise<ReadonlyProject>;
}
