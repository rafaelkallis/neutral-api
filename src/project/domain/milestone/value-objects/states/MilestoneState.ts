import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { InternalMilestone } from 'project/domain/milestone/Milestone';
import { DomainException } from 'shared/domain/exceptions/DomainException';
import { Comprarable } from 'shared/domain/value-objects/Comparable';
import { ProjectAnalyzer } from 'project/domain/ProjectAnalyzer';

/**
 *
 */
export abstract class MilestoneState
  extends ValueObject
  implements Comprarable<MilestoneState> {
  // eslint-disable-next-line @typescript-eslint/require-await
  public async submitPeerReviews(
    _milestone: InternalMilestone,
    _peerReviews: ReadonlyPeerReviewCollection,
    _projectAnalyzer: ProjectAnalyzer,
  ): Promise<void> {
    this.throwNotSupportedByCurrentMilestateException();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async completePeerReviews(
    _milestone: InternalMilestone,
    _projectAnalyzer: ProjectAnalyzer,
  ): Promise<void> {
    this.throwNotSupportedByCurrentMilestateException();
  }

  public submitManagerReview(_milestone: InternalMilestone): void {
    this.throwNotSupportedByCurrentMilestateException();
  }

  public cancel(_milestone: InternalMilestone): void {
    this.throwNotSupportedByCurrentMilestateException();
  }

  private throwNotSupportedByCurrentMilestateException(): never {
    throw new DomainException(
      'operation_not_supported_by_current_milestone_state',
      'Operation is not supported by current milestone state.',
    );
  }

  public abstract isTerminal(): boolean;

  public compareTo(other: MilestoneState): number {
    return this.getOrdinal() - other.getOrdinal();
  }

  protected abstract getOrdinal(): number;
}
