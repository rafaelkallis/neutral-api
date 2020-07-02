import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { MeanDeviationConsensualityComputerService } from 'project/infrastructure/MeanDeviationConsensualityComputer';
import { VarianceConsensualityComputerService } from 'project/infrastructure/VarianceConsensualityComputer';
import { PairwiseRelativeJudgementsConsensualityComputer } from 'project/infrastructure/PairwiseRelativeJudgementsConsensualityComputer';
import { InternalProject } from 'project/domain/project/Project';
import { Role } from 'project/domain/role/Role';
import { ModelFaker } from 'test/ModelFaker';
import { UserId } from 'user/domain/value-objects/UserId';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';

describe(ConsensualityComputer.name, () => {
  let consensualityComputer: ConsensualityComputer;

  let modelFaker: ModelFaker;

  let roleA: Role;
  let roleB: Role;
  let roleC: Role;
  let roleD: Role;
  let reviewTopic: ReviewTopic;

  let cycleProject: InternalProject;
  let clusterProject: InternalProject;
  let oneDidItAllProject: InternalProject;
  let coveeWhitepaper4PersonProject: InternalProject;
  let some3PersonProject: InternalProject;

  beforeEach(() => {
    console.log('-------------------------------------------------');
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
          [b]: 1,
          [c]: 0,
          [d]: 0,
        },
        [b]: {
          [a]: 0,
          [c]: 1,
          [d]: 0,
        },
        [c]: {
          [a]: 0,
          [b]: 0,
          [d]: 1,
        },
        [d]: {
          [a]: 1,
          [b]: 0,
          [c]: 0,
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
          [b]: 1,
          [c]: 0,
          [d]: 0,
        },
        [b]: {
          [a]: 1,
          [c]: 0,
          [d]: 0,
        },
        [c]: {
          [a]: 0,
          [b]: 0,
          [d]: 1,
        },
        [d]: {
          [a]: 0,
          [b]: 0,
          [c]: 1,
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
          [b]: 0,
          [c]: 0,
          [d]: 1,
        },
        [b]: {
          [a]: 0,
          [c]: 0,
          [d]: 1,
        },
        [c]: {
          [a]: 0,
          [b]: 0,
          [d]: 1,
        },
        [d]: {
          [a]: 1 / 3,
          [b]: 1 / 3,
          [c]: 1 / 3,
        },
      },
      reviewTopic.id,
    );

    coveeWhitepaper4PersonProject = modelFaker.project(UserId.create());
    coveeWhitepaper4PersonProject.roles.addAll([roleA, roleB, roleC, roleD]);
    coveeWhitepaper4PersonProject.reviewTopics.add(reviewTopic);
    coveeWhitepaper4PersonProject.peerReviews = PeerReviewCollection.fromMap(
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
      reviewTopic.id,
    );

    some3PersonProject = modelFaker.project(UserId.create());
    some3PersonProject.roles.addAll([roleA, roleB, roleC]);
    some3PersonProject.reviewTopics.add(reviewTopic);
    some3PersonProject.peerReviews = PeerReviewCollection.fromMap(
      {
        [a]: {
          [b]: 20 / 90,
          [c]: 70 / 90,
        },
        [b]: {
          [a]: 10 / 80,
          [c]: 70 / 80,
        },
        [c]: {
          [a]: 10 / 70,
          [b]: 60 / 70,
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

    test('covee whitepaper 4 person', () => {
      const result = consensualityComputer.compute(
        coveeWhitepaper4PersonProject,
      );
      expect(result.ofReviewTopic(reviewTopic.id).value).toBeCloseTo(0.908);
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

    test('covee whitepaper 4 person', () => {
      const result = consensualityComputer.compute(
        coveeWhitepaper4PersonProject,
      );
      expect(result.ofReviewTopic(reviewTopic.id).value).toBeCloseTo(0.988);
    });
  });

  describe(PairwiseRelativeJudgementsConsensualityComputer, () => {
    beforeEach(() => {
      consensualityComputer = new PairwiseRelativeJudgementsConsensualityComputer();
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

    test('covee whitepaper 4 person', () => {
      const result = consensualityComputer.compute(
        coveeWhitepaper4PersonProject,
      );
      expect(result.ofReviewTopic(reviewTopic.id).value).toBeCloseTo(1);
    });

    test('some 3 person', () => {
      const result = consensualityComputer.compute(some3PersonProject);
      expect(result.ofReviewTopic(reviewTopic.id).value).toBeCloseTo(1);
    });
  });
});
