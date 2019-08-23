import { Injectable } from '@nestjs/common';

import {
  InsufficientPermissionsException,
  Project,
  ProjectState,
  ProjectRepository,
  Role,
  RoleRepository,
  RandomService,
  User,
} from '../common';
import { ModelService } from './services/model.service';

import { ForbiddenProjectStateChangeException } from './exceptions/forbidden-project-state-change.exception';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  private readonly projectRepository: ProjectRepository;
  private readonly roleRepository: RoleRepository;
  private readonly randomService: RandomService;
  private readonly modelService: ModelService;

  public constructor(
    projectRepository: ProjectRepository,
    roleRepository: RoleRepository,
    randomService: RandomService,
    modelService: ModelService,
  ) {
    this.projectRepository = projectRepository;
    this.roleRepository = roleRepository;
    this.randomService = randomService;
    this.modelService = modelService;
  }

  /**
   * Get projects
   */
  public async getProjects(): Promise<Project[]> {
    return this.projectRepository.find();
  }

  /**
   * Get a project
   */
  public async getProject(id: string): Promise<Project> {
    return this.projectRepository.findOneOrFail({ id });
  }

  /**
   * Create a project
   */
  public async createProject(
    authUser: User,
    dto: CreateProjectDto,
  ): Promise<Project> {
    const project = Project.from({
      id: this.randomService.id(),
      ownerId: authUser.id,
      title: dto.title,
      description: dto.description,
      state: ProjectState.FORMATION,
    });
    return this.projectRepository.save(project);
  }

  /**
   * Update a project
   */
  public async updateProject(
    authUser: User,
    id: string,
    dto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.projectRepository.findOneOrFail({ id });
    this.isProjectOwnerOrFail(project, authUser);
    if (dto.state) {
      const roles = await this.roleRepository.find({ projectId: project.id });
      await this.isValidProjectStateChangeOrFail(project, roles, dto.state);
      if (
        project.state === ProjectState.PEER_REVIEW &&
        dto.state === ProjectState.FINISHED
      ) {
        const peerReviews: Record<string, Record<string, number>> = {};
        for (const role of roles) {
          if (!role.peerReviews) {
            throw new Error();
          }
          peerReviews[role.id] = role.peerReviews;
          peerReviews[role.id][role.id] = 0;
        }
        project.relativeContributions = this.modelService.computeRelativeContributions(
          peerReviews,
        );
      }
    }
    project.update(dto);
    return this.projectRepository.save(project);
  }

  private isProjectOwnerOrFail(project: Project, user: User): void {
    if (project.ownerId !== user.id) {
      throw new InsufficientPermissionsException();
    }
  }

  private async isValidProjectStateChangeOrFail(
    project: Project,
    roles: Role[],
    nextState: ProjectState,
  ): Promise<void> {
    const curState = project.state;
    if (curState === nextState) {
      return;
    }
    if (
      curState === ProjectState.FORMATION &&
      nextState === ProjectState.PEER_REVIEW
    ) {
      for (const role of roles) {
        if (!role.assigneeId) {
          throw new ForbiddenProjectStateChangeException();
        }
      }
      return;
    }
    if (
      curState === ProjectState.PEER_REVIEW &&
      nextState === ProjectState.FINISHED
    ) {
      for (const role of roles) {
        if (!role.peerReviews) {
          throw new ForbiddenProjectStateChangeException();
        }
      }
      return;
    }
    throw new ForbiddenProjectStateChangeException();
  }

  /**
   * Delete a project
   */
  public async deleteProject(authUser: User, id: string): Promise<void> {
    const project = await this.projectRepository.findOneOrFail({ id });
    if (project.ownerId !== authUser.id) {
      throw new InsufficientPermissionsException();
    }
    await this.projectRepository.remove(project);
  }

  /**
   * Get relative contributions of a project
   */
  public async getRelativeContributions(
    authUser: User,
    id: string,
  ): Promise<Record<string, number>> {
    const project = await this.projectRepository.findOneOrFail({ id });
    if (project.ownerId !== authUser.id) {
      throw new InsufficientPermissionsException();
    }
    const roles = await this.roleRepository.find({ projectId: id });
    const peerReviews: Record<string, Record<string, number>> = {};
    for (const role of roles) {
      if (!role.peerReviews) {
        throw new Error();
      }
      peerReviews[role.id] = role.peerReviews;
      peerReviews[role.id][role.id] = 0;
    }
    return this.modelService.computeRelativeContributions(peerReviews);
  }
}
