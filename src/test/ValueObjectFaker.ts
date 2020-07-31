import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/review-topic/value-objects/ReviewTopicDescription';
import { Email } from 'user/domain/value-objects/Email';
import {
  ReviewTopicInput,
  ContinuousReviewTopicInput,
} from 'project/domain/review-topic/ReviewTopicInput';
import { OrganizationName } from 'organization/domain/value-objects/OrganizationName';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/project/value-objects/ProjectDescription';

export class ValueObjectFaker {
  public readonly user: UserValueObjectFaker;
  public readonly project: ProjectValueObjectFaker;
  public readonly role: RoleValueObjectFaker;
  public readonly reviewTopic: ReviewTopicValueObjectFaker;
  public readonly organization: OrganizationValueObjectFaker;

  public constructor(primitiveFaker: PrimitiveFaker = new PrimitiveFaker()) {
    this.user = new UserValueObjectFaker(primitiveFaker);
    this.project = new ProjectValueObjectFaker(primitiveFaker);
    this.role = new RoleValueObjectFaker(primitiveFaker);
    this.reviewTopic = new ReviewTopicValueObjectFaker(primitiveFaker);
    this.organization = new OrganizationValueObjectFaker(primitiveFaker);
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

class ProjectValueObjectFaker extends ModelValueObjectFaker {
  public title(): ProjectTitle {
    return ProjectTitle.from(this.primitiveFaker.words());
  }

  public description(): ProjectDescription {
    return ProjectDescription.from(this.primitiveFaker.paragraph());
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

  public input(): ReviewTopicInput {
    const min = this.primitiveFaker.integer();
    const max = min + 1 + this.primitiveFaker.integer();
    return ContinuousReviewTopicInput.of(min, max);
  }
}

class OrganizationValueObjectFaker extends ModelValueObjectFaker {
  public name(): OrganizationName {
    return RoleTitle.from(this.primitiveFaker.words());
  }
}
