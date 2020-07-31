import { PartialType, PickType } from '@nestjs/swagger';
import { ProjectDto } from './ProjectDto';
import { UpdateProjectContext } from 'project/domain/project/Project';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/project/value-objects/ProjectDescription';
import { PeerReviewVisibility } from 'project/domain/project/value-objects/PeerReviewVisibility';
import { ContributionVisibility } from 'project/domain/project/value-objects/ContributionVisibility';
import { SkipManagerReview } from 'project/domain/project/value-objects/SkipManagerReview';

export class UpdateProjectDto extends PartialType(
  PickType(ProjectDto, [
    'title',
    'description',
    'meta',
    'peerReviewVisibility',
    'contributionVisibility',
    'skipManagerReview',
  ] as const),
) {
  public toUpdateProjectContext(): UpdateProjectContext {
    return {
      title: this.title ? ProjectTitle.from(this.title) : undefined,
      description: this.description
        ? ProjectDescription.from(this.description)
        : undefined,
      peerReviewVisibility: this.peerReviewVisibility
        ? PeerReviewVisibility.ofLabel(this.peerReviewVisibility)
        : undefined,
      contributionVisibility: this.contributionVisibility
        ? ContributionVisibility.ofValue(this.contributionVisibility)
        : undefined,
      skipManagerReview: this.skipManagerReview
        ? SkipManagerReview.from(this.skipManagerReview)
        : undefined,
      meta: this.meta,
    };
  }
}
