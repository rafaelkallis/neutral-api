import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { CoveeContributionsComputerService } from 'project/infrastructure/CoveeContributionsComputerService';
import { PeerReviewCollection } from 'project/domain/PeerReviewCollection';
import { Id } from 'shared/domain/value-objects/Id';
import { PrimitiveFaker } from 'test/PrimitiveFaker';

describe('ContributionsModelService', () => {
  let primitiveFaker: PrimitiveFaker;
  let a: string;
  let b: string;
  let c: string;
  let d: string;
  let specificationsDocumentExamplePeerReviews: PeerReviewCollection;

  beforeEach(() => {
    primitiveFaker = new PrimitiveFaker();
    a = primitiveFaker.id();
    b = primitiveFaker.id();
    c = primitiveFaker.id();
    d = primitiveFaker.id();
    specificationsDocumentExamplePeerReviews = PeerReviewCollection.fromMap({
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
    });
  });

  describe('covee method', () => {
    let contributionsComputer: ContributionsComputer;

    beforeEach(() => {
      contributionsComputer = new CoveeContributionsComputerService();
    });

    test('should be defined', () => {
      expect(contributionsComputer).toBeDefined();
    });

    test('compute contributions from specifications document example (>=4)', () => {
      const contributions = contributionsComputer.compute(
        specificationsDocumentExamplePeerReviews,
      );
      expect(contributions.of(Id.from(a)).value).toBeCloseTo(0.1);
      expect(contributions.of(Id.from(b)).value).toBeCloseTo(0.2);
      expect(contributions.of(Id.from(c)).value).toBeCloseTo(0.3);
      expect(contributions.of(Id.from(d)).value).toBeCloseTo(0.4);
    });
  });
});
