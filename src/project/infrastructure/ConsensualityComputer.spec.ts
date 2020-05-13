import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { MeanDeviationConsensualityComputerService } from 'project/infrastructure/MeanDeviationConsensualityComputer';
import { VarianceConsensualityComputerService } from 'project/infrastructure/VarianceConsensualityComputer';
import { PairwiseRelativeJudgementsConsensualityComputerService } from 'project/infrastructure/PairwiseRelativeJudgementsConsensualityComputer';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { Project } from 'project/domain/project/Project';
import { Role } from 'project/domain/role/Role';
import { ModelFaker } from 'test/ModelFaker';
import { UserId } from 'user/domain/value-objects/UserId';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';

describe('consensuality computer', () => {
  let consensualityComputer: ConsensualityComputer;

  let modelFaker: ModelFaker;

  let roleA: Role;
  let roleB: Role;
  let roleC: Role;
  let roleD: Role;
  let reviewTopic: ReviewTopic;

  let cycleProject: Project;
  let clusterProject: Project;
  let oneDidItAllProject: Project;

  const o = PeerReviewScore.EPSILON;
  const l = 1 - 3 * PeerReviewScore.EPSILON;

  beforeEach(() => {
    modelFaker = new ModelFaker();

    roleA = modelFaker.role();
    roleB = modelFaker.role();
    roleC = modelFaker.role();
    roleD = modelFaker.role();
    reviewTopic = modelFaker.reviewTopic();

    const a = roleA.id.value;
    const b = roleB.id.value;
    const c = roleC.id.value;
    const d = roleD.id.value;

    cycleProject = modelFaker.project(UserId.create());
    cycleProject.roles.addAll([roleA, roleB, roleC, roleD]);
    cycleProject.reviewTopics.add(reviewTopic);
    cycleProject.peerReviews = PeerReviewCollection.fromMap(
      {
        [a]: {
          [b]: l,
          [c]: o,
          [d]: o,
        },
        [b]: {
          [a]: o,
          [c]: l,
          [d]: o,
        },
        [c]: {
          [a]: o,
          [b]: o,
          [d]: l,
        },
        [d]: {
          [a]: l,
          [b]: o,
          [c]: o,
        },
      },
      reviewTopic.id,
    );

    clusterProject = modelFaker.project(UserId.create());
    clusterProject.roles.addAll([roleA, roleB, roleC, roleD]);
    clusterProject.reviewTopics.add(reviewTopic);
    clusterProject.peerReviews = PeerReviewCollection.fromMap(
      {
        [a]: {
          [b]: l,
          [c]: o,
          [d]: o,
        },
        [b]: {
          [a]: l,
          [c]: o,
          [d]: o,
        },
        [c]: {
          [a]: o,
          [b]: o,
          [d]: l,
        },
        [d]: {
          [a]: o,
          [b]: o,
          [c]: l,
        },
      },
      reviewTopic.id,
    );

    oneDidItAllProject = modelFaker.project(UserId.create());
    oneDidItAllProject.roles.addAll([roleA, roleB, roleC, roleD]);
    oneDidItAllProject.reviewTopics.add(reviewTopic);
    oneDidItAllProject.peerReviews = PeerReviewCollection.fromMap(
      {
        [a]: {
          [b]: o,
          [c]: o,
          [d]: l,
        },
        [b]: {
          [a]: o,
          [c]: o,
          [d]: l,
        },
        [c]: {
          [a]: o,
          [b]: o,
          [d]: l,
        },
        [d]: {
          [a]: 1 / 3,
          [b]: 1 / 3,
          [c]: 1 / 3,
        },
      },
      reviewTopic.id,
    );
  });

  describe(MeanDeviationConsensualityComputerService.name, () => {
    beforeEach(() => {
      consensualityComputer = new MeanDeviationConsensualityComputerService();
    });

    test('cycle', () => {
      const result = consensualityComputer.compute(cycleProject);
      expect(result.ofReviewTopic(reviewTopic.id).value).toBeCloseTo(0);
    });

    test('clusters', () => {
      const result = consensualityComputer.compute(clusterProject);
      expect(result.ofReviewTopic(reviewTopic.id).value).toBeCloseTo(0);
    });

    test('one did everything', () => {
      const result = consensualityComputer.compute(oneDidItAllProject);
      expect(result.ofReviewTopic(reviewTopic.id).value).toBeCloseTo(3 / 4);
    });
  });

  describe(VarianceConsensualityComputerService, () => {
    beforeEach(() => {
      consensualityComputer = new VarianceConsensualityComputerService();
    });

    test('cycle', () => {
      const result = consensualityComputer.compute(cycleProject);
      expect(result.ofReviewTopic(reviewTopic.id).value).toBeCloseTo(0);
    });

    test('clusters', () => {
      const result = consensualityComputer.compute(clusterProject);
      expect(result.ofReviewTopic(reviewTopic.id).value).toBeCloseTo(0);
    });

    test('one did everything', () => {
      const result = consensualityComputer.compute(oneDidItAllProject);
      expect(result.ofReviewTopic(reviewTopic.id).value).toBeCloseTo(0.91666);
    });
  });

  describe(PairwiseRelativeJudgementsConsensualityComputerService, () => {
    beforeEach(() => {
      consensualityComputer = new PairwiseRelativeJudgementsConsensualityComputerService();
    });

    test('cycle', () => {
      const result = consensualityComputer.compute(cycleProject);
      expect(result.ofReviewTopic(reviewTopic.id).value).toBeCloseTo(0);
    });

    test('clusters', () => {
      const result = consensualityComputer.compute(clusterProject);
      expect(result.ofReviewTopic(reviewTopic.id).value).toBeCloseTo(0);
    });

    test('one did everything', () => {
      const result = consensualityComputer.compute(oneDidItAllProject);
      expect(result.ofReviewTopic(reviewTopic.id).value).toBeCloseTo(1);
    });
  });
});
