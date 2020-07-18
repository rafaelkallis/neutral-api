import { DomainException } from 'shared/domain/exceptions/DomainException';

export enum PeerReviewFlag {
  NONE = 'none',
  ASBENT = 'absent',
}

export function peerReviewFlagToString(flag: PeerReviewFlag): string {
  return flag;
}

export function stringToPeerReviewFlag(flagString: string): PeerReviewFlag {
  for (const flag of Object.values(PeerReviewFlag)) {
    if (flagString === flag) {
      return flag;
    }
  }
  throw new DomainException(
    'invalid_peer_review_flag',
    'Invalid peer-review flag',
  );
}
