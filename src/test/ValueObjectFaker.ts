import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/review-topic/value-objects/ReviewTopicDescription';
import { Email } from 'user/domain/value-objects/Email';

export class ValueObjectFaker {
  public readonly user: UserValueObjectFaker;
  public readonly role: RoleValueObjectFaker;
  public readonly reviewTopic: ReviewTopicValueObjectFaker;

  public constructor(primitiveFaker: PrimitiveFaker) {
    this.user = new UserValueObjectFaker(primitiveFaker);
    this.role = new RoleValueObjectFaker(primitiveFaker);
    this.reviewTopic = new ReviewTopicValueObjectFaker(primitiveFaker);
  }
}

abstract class ModelValueObjectFaker {
  protected readonly primitiveFaker: PrimitiveFaker;

  public constructor(primitiveFaker: PrimitiveFaker) {
    this.primitiveFaker = primitiveFaker;
  }
}

class UserValueObjectFaker extends ModelValueObjectFaker {
  public email(): Email {
    return Email.of(this.primitiveFaker.email());
  }
}

class RoleValueObjectFaker extends ModelValueObjectFaker {
  public title(): RoleTitle {
    return RoleTitle.from(this.primitiveFaker.words());
  }

  public description(): RoleDescription {
    return RoleDescription.from(this.primitiveFaker.paragraph());
  }
}

class ReviewTopicValueObjectFaker extends ModelValueObjectFaker {
  public title(): ReviewTopicTitle {
    return ReviewTopicTitle.from(this.primitiveFaker.words());
  }

  public description(): ReviewTopicDescription {
    return ReviewTopicDescription.from(this.primitiveFaker.paragraph());
  }
}
