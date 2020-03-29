import {
  ModelMap,
  AbstractModelMap,
  ModelMapContext,
} from 'shared/model-mapper/ModelMap';
import { Project } from 'project/domain/Project';
import { User } from 'user/domain/User';
import { PeerReview } from 'project/domain/PeerReview';
import { PeerReviewDto } from './dto/PeerReviewDto';

@ModelMap(PeerReview, PeerReviewDto)
export class PeerReviewDtoMap extends AbstractModelMap<
  PeerReview,
  PeerReviewDto
> {
  protected innerMap(
    peerReview: PeerReview,
    context: ModelMapContext,
  ): PeerReviewDto {
    const project = context.get('project', Project);
    const authUser = context.get('authUser', User);
    return new PeerReviewDto(
      peerReview.id.value,
      peerReview.senderRoleId.value,
      peerReview.receiverRoleId.value,
      this.mapScore(peerReview, project, authUser),
      peerReview.createdAt.value,
      peerReview.updatedAt.value,
    );
  }

  private mapScore(
    peerReview: PeerReview,
    project: Project,
    authUser: User,
  ): number | null {
    let shouldExpose = false;
    if (project.isCreator(authUser)) {
      shouldExpose = true;
    } else if (project.roles.anyAssignedToUser(authUser)) {
      const authUserRole = project.roles.findByAssignee(authUser);
      if (peerReview.isSenderRole(authUserRole)) {
        shouldExpose = true;
      }
    }
    return shouldExpose ? peerReview.score.value : null;
  }
}
