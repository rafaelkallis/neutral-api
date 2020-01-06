import { Injectable, Inject, Optional } from '@nestjs/common';
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
  private readonly userRepository: UserRepository | null;
  private readonly projectRepository: ProjectRepository | null;
  private readonly roleRepository: RoleRepository | null;
  private readonly peerReviewRepository: PeerReviewRepository | null;

  public constructor(
    objectFaker: ObjectFaker,
    @Optional() @Inject(USER_REPOSITORY) userRepository: UserRepository | null,
    @Optional()
    @Inject(PROJECT_REPOSITORY)
    projectRepository: ProjectRepository | null,
    @Optional() @Inject(ROLE_REPOSITORY) roleRepository: RoleRepository | null,
    @Optional()
    @Inject(PEER_REVIEW_REPOSITORY)
    peerReviewRepository: PeerReviewRepository | null,
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
    if (!this.userRepository) {
      throw new Error('no userRepository provided');
    }
    return this.userRepository.createEntity(this.objectFaker.user());
  }

  /**
   * Create fake project
   */
  public project(ownerId: string): ProjectEntity {
    if (!this.projectRepository) {
      throw new Error('no roleRepository provided');
    }
    return this.projectRepository.createEntity(
      this.objectFaker.project(ownerId),
    );
  }

  /**
   * Create a fake role
   */
  public role(projectId: string, assigneeId: string | null = null): RoleEntity {
    if (!this.roleRepository) {
      throw new Error('no roleRepository provided');
    }
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
    if (!this.peerReviewRepository) {
      throw new Error('no peerReviewRepository provided');
    }
    return this.peerReviewRepository.createEntity(
      this.objectFaker.peerReview(senderRoleId, receiverRoleId),
    );
  }
}
