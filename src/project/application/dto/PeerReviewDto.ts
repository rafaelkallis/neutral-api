import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'shared/application/dto/BaseDto';
import { PeerReview } from 'project/domain/PeerReview';
import { Project } from 'project/domain/Project';
import { User } from 'user/domain/User';

/**
 * Peer Review DTO
 */
export class PeerReviewDto extends BaseDto {
  @ApiProperty({ required: false })
  public senderRoleId: string | null;

  @ApiProperty({ required: false })
  public receiverRoleId: string | null;

  @ApiProperty({ required: false })
  public score: number | null;

  public constructor(
    id: string,
    senderRoleId: string | null,
    receiverRoleId: string | null,
    score: number | null,
    createdAt: number,
    updatedAt: number,
  ) {
    super(id, createdAt, updatedAt);
    this.senderRoleId = senderRoleId;
    this.receiverRoleId = receiverRoleId;
    this.score = score;
  }

  public static builder(): PeerReviewStep {
    return new PeerReviewStep();
  }
}

class PeerReviewStep {
  public constructor() {}
  public peerReview(peerReview: PeerReview): ProjectStep {
    return new ProjectStep(peerReview);
  }
}

class ProjectStep {
  private readonly peerReview: PeerReview;

  public constructor(peerReview: PeerReview) {
    this.peerReview = peerReview;
  }

  public project(project: Project): AuthUserStep {
    return new AuthUserStep(this.peerReview, project);
  }
}

class AuthUserStep {
  private readonly peerReview: PeerReview;
  private readonly project: Project;
  public constructor(peerReview: PeerReview, project: Project) {
    this.peerReview = peerReview;
    this.project = project;
  }
  public authUser(authUser: User): BuildStep {
    return new BuildStep(this.peerReview, this.project, authUser);
  }
}

class BuildStep {
  private readonly peerReview: PeerReview;
  private readonly project: Project;
  private readonly authUser: User;
  public constructor(peerReview: PeerReview, project: Project, authUser: User) {
    this.peerReview = peerReview;
    this.project = project;
    this.authUser = authUser;
  }
  public build(): PeerReviewDto {
    const { peerReview } = this;
    return new PeerReviewDto(
      peerReview.id.value,
      peerReview.senderRoleId.value,
      peerReview.receiverRoleId.value,
      this.shouldExposeScore() ? peerReview.score.value : null,
      peerReview.createdAt.value,
      peerReview.updatedAt.value,
    );
  }

  private shouldExposeScore(): boolean {
    const { peerReview, project, authUser } = this;
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
