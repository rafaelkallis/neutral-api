import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository, PROJECT_REPOSITORY, ProjectEntity } from 'project';
import { UserRepository, USER_REPOSITORY, UserEntity } from 'user';
import {
  RoleRepository,
  PeerReviewRepository,
  ROLE_REPOSITORY,
  PEER_REVIEW_REPOSITORY,
  RoleEntity,
  PeerReviewEntity,
} from 'role';
import { ObjectFaker } from 'test/fakers/object-faker';

@Injectable()
export class EntityFaker {
  private readonly objectFaker: ObjectFaker;
  private readonly userRepository: UserRepository;
  private readonly projectRepository: ProjectRepository;
  private readonly roleRepository: RoleRepository;
  private readonly peerReviewRepository: PeerReviewRepository;

  public constructor(
    objectFaker: ObjectFaker,
    @Inject(USER_REPOSITORY) userRepository: UserRepository,
    @Inject(PROJECT_REPOSITORY) projectRepository: ProjectRepository,
    @Inject(ROLE_REPOSITORY) roleRepository: RoleRepository,
    @Inject(PEER_REVIEW_REPOSITORY) peerReviewRepository: PeerReviewRepository,
  ) {
    this.objectFaker = objectFaker;
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.roleRepository = roleRepository;
    this.peerReviewRepository = peerReviewRepository;
  }

  /**
   * Create fake user
   */
  public user(): UserEntity {
    return this.userRepository.createEntity(this.objectFaker.user());
  }

  /**
   * Create fake project
   */
  public project(ownerId: string): ProjectEntity {
    return this.projectRepository.createEntity(
      this.objectFaker.project(ownerId),
    );
  }

  /**
   * Create a fake role
   */
  public role(projectId: string, assigneeId: string | null = null): RoleEntity {
    return this.roleRepository.createEntity(
      this.objectFaker.role(projectId, assigneeId),
    );
  }

  /**
   * Create a fake peer review
   */
  public peerReview(
    senderRoleId: string,
    receiverRoleId: string,
  ): PeerReviewEntity {
    return this.peerReviewRepository.createEntity(
      this.objectFaker.peerReview(senderRoleId, receiverRoleId),
    );
  }
}
