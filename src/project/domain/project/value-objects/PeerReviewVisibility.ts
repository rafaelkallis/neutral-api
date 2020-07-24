import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { InversableMap } from 'shared/domain/InversableMap';

export enum PeerReviewVisibilityValue {
  PUBLIC = 'public',
  PROJECT = 'project',
  MANAGER = 'manager',
  SELF = 'self',
}

export interface PeerReviewVisibilityVisitor<T> {
  public(): T;
  project(): T;
  manager(): T;
  self(): T;
}

export abstract class PeerReviewVisibility extends ValueObject {
  public abstract accept<T>(visitor: PeerReviewVisibilityVisitor<T>): T;
}

export class PublicPeerReviewVisibility extends PeerReviewVisibility {
  public static readonly INSTANCE = new PublicPeerReviewVisibility();
  public accept<T>(visitor: PeerReviewVisibilityVisitor<T>): T {
    return visitor.public();
  }

  private constructor() {
    super();
  }
}

export class ProjectPeerReviewVisibility extends PeerReviewVisibility {
  public static readonly INSTANCE = new ProjectPeerReviewVisibility();
  public accept<T>(visitor: PeerReviewVisibilityVisitor<T>): T {
    return visitor.project();
  }

  private constructor() {
    super();
  }
}

export class ManagerPeerReviewVisibility extends PeerReviewVisibility {
  public static readonly INSTANCE = new ManagerPeerReviewVisibility();
  public accept<T>(visitor: PeerReviewVisibilityVisitor<T>): T {
    return visitor.manager();
  }

  private constructor() {
    super();
  }
}

export class SelfPeerReviewVisibility extends PeerReviewVisibility {
  public static readonly INSTANCE = new SelfPeerReviewVisibility();
  public accept<T>(visitor: PeerReviewVisibilityVisitor<T>): T {
    return visitor.self();
  }

  private constructor() {
    super();
  }
}

export const peerReviewVisibilityMap = InversableMap.of<
  PeerReviewVisibilityValue,
  PeerReviewVisibility
>([
  [PeerReviewVisibilityValue.PUBLIC, PublicPeerReviewVisibility.INSTANCE],
  [PeerReviewVisibilityValue.PROJECT, ProjectPeerReviewVisibility.INSTANCE],
  [PeerReviewVisibilityValue.MANAGER, ManagerPeerReviewVisibility.INSTANCE],
  [PeerReviewVisibilityValue.SELF, SelfPeerReviewVisibility.INSTANCE],
]).toReadonly();
