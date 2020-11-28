import { Id } from 'shared/domain/value-objects/Id';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { InvalidPeerReviewIdException } from 'project/domain/exceptions/InvalidPeerReviewIdException';

export class PeerReviewId extends Id {
  private constructor(value: string) {
    super(value);
  }

  public static from(id: string): PeerReviewId {
    return new PeerReviewId(id);
  }

  public static create(): PeerReviewId {
    return new PeerReviewId(Id.createInner());
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof PeerReviewId)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidPeerReviewIdException();
  }
}
