import {
  ModelMap,
  AbstractModelMap,
  ModelMapContext,
} from 'shared/model-mapper/ModelMap';
import { Project } from 'project/domain/Project';
import { ProjectDto } from './dto/ProjectDto';
import { User } from 'user/domain/User';
import { InternalServerErrorException } from '@nestjs/common';
import { RoleDto } from './dto/RoleDto';
import { PeerReviewDto } from './dto/PeerReviewDto';
import { PeerReview } from 'project/domain/PeerReview';
import { ModelMapper } from 'shared/model-mapper/ModelMapper';

@ModelMap(Project, ProjectDto)
export class ProjectDtoMap extends AbstractModelMap<Project, ProjectDto> {
  private readonly modelMapper: ModelMapper;

  public constructor(modelMapper: ModelMapper) {
    super();
    this.modelMapper = modelMapper;
  }

  public map(project: Project, { authUser }: ModelMapContext): ProjectDto {
    if (!(authUser instanceof User)) {
      throw new InternalServerErrorException();
    }
    return new ProjectDto(
      project.id.value,
      project.title.value,
      project.description.value,
      project.creatorId.value,
      project.state.value,
      this.mapConsensuality(project, authUser),
      project.contributionVisibility.value,
      project.skipManagerReview.value,
      this.mapRoleDtos(project, authUser),
      this.mapPeerReviewDtos(project, authUser),
      project.createdAt.value,
      project.updatedAt.value,
    );
  }

  private mapConsensuality(project: Project, authUser: User): number | null {
    const shouldExpose = project.isCreator(authUser);
    if (!shouldExpose) {
      return null;
    }
    if (!project.consensuality) {
      return null;
    }
    return project.consensuality.value;
  }

  private mapRoleDtos(project: Project, authUser: User): RoleDto[] {
    const roles = Array.from(project.roles);
    return roles.map((role) =>
      this.modelMapper.map(role, RoleDto, { project, authUser }),
    );
  }

  private mapPeerReviewDtos(project: Project, authUser: User): PeerReviewDto[] {
    const peerReviews = Array.from(project.peerReviews);
    return peerReviews
      .filter((peerReview) =>
        this.shouldExposePeerReview(peerReview, project, authUser),
      )
      .map((peerReview) =>
        PeerReviewDto.builder()
          .peerReview(peerReview)
          .project(project)
          .authUser(authUser)
          .build(),
      );
  }

  private shouldExposePeerReview(
    peerReview: PeerReview,
    project: Project,
    authUser: User,
  ): boolean {
    if (project.isCreator(authUser)) {
      return true;
    }
    if (project.roles.anyAssignedToUser(authUser)) {
      const authUserRole = project.roles.findByAssignee(authUser);
      if (peerReview.isSenderRole(authUserRole)) {
        return true;
      }
    }
    return false;
  }
}
