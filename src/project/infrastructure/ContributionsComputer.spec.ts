import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { CoveeContributionsComputer } from 'project/infrastructure/CoveeContributionsComputer';
import {
  PeerReviewCollection,
  ReadonlyPeerReviewCollection,
} from 'project/domain/peer-review/PeerReviewCollection';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';

describe('ContributionsModelService', () => {
  let primitiveFaker: PrimitiveFaker;
  let a: string;
  let b: string;
  let c: string;
  let d: string;
  let specificationsDocumentExamplePeerReviews: ReadonlyPeerReviewCollection;

  beforeEach(() => {
    primitiveFaker = new PrimitiveFaker();
    a = primitiveFaker.id();
    b = primitiveFaker.id();
    c = primitiveFaker.id();
    d = primitiveFaker.id();
    specificationsDocumentExamplePeerReviews = PeerReviewCollection.fromMap(
      {
        [a]: {
          [b]: 20 / 90,
          [c]: 30 / 90,
          [d]: 40 / 90,
        },
        [b]: {
          [a]: 10 / 80,
          [c]: 30 / 80,
          [d]: 40 / 80,
        },
        [c]: {
          [a]: 10 / 70,
          [b]: 20 / 70,
          [d]: 40 / 70,
        },
        [d]: {
          [a]: 10 / 60,
          [b]: 20 / 60,
          [c]: 30 / 60,
        },
      },
      ReviewTopicId.create(),
    );
  });

  describe('covee method', () => {
    let contributionsComputer: ContributionsComputer;

    beforeEach(() => {
      contributionsComputer = new CoveeContributionsComputer();
    });

    test('should be defined', () => {
      expect(contributionsComputer).toBeDefined();
    });

    test('compute contributions from specifications document example (>=4)', () => {
      const contributions = contributionsComputer.compute(
        specificationsDocumentExamplePeerReviews,
      );
      expect(
        contributions.find((con) => con.roleId.equals(RoleId.from(a)))?.amount
          .value,
      ).toBeCloseTo(0.1);
      expect(
        contributions.find((con) => con.roleId.equals(RoleId.from(b)))?.amount
          .value,
      ).toBeCloseTo(0.2);
      expect(
        contributions.find((con) => con.roleId.equals(RoleId.from(c)))?.amount
          .value,
      ).toBeCloseTo(0.3);
      expect(
        contributions.find((con) => con.roleId.equals(RoleId.from(d)))?.amount
          .value,
      ).toBeCloseTo(0.4);
    });
  });
});
