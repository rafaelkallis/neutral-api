import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ProjectDto } from './ProjectDto';

export class CreateProjectDto extends IntersectionType(
  PickType(ProjectDto, [
    'title',
    'description',
    'contributionVisibility',
    'skipManagerReview',
  ] as const),
  PartialType(
    PickType(ProjectDto, [
      'meta',
      'peerReviewVisibility', // TODO make required
    ] as const),
  ),
) {
  @IsOptional()
  public meta?: Record<string, unknown>;
}
