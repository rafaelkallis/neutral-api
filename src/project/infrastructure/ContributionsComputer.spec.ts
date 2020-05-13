import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { CoveeContributionsComputer } from 'project/infrastructure/CoveeContributionsComputer';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { ModelFaker } from 'test/ModelFaker';
import { Project } from 'project/domain/project/Project';
import { UserId } from 'user/domain/value-objects/UserId';
import { Role } from 'project/domain/role/Role';

describe('ContributionsModelService', () => {
  let modelFaker: ModelFaker;
  let roleA: Role;
  let roleB: Role;
  let roleC: Role;
  let roleD: Role;
  let a: string;
  let b: string;
  let c: string;
  let d: string;
  let project: Project;

  beforeEach(() => {
    modelFaker = new ModelFaker();
    project = modelFaker.project(UserId.create());
    project.reviewTopics.add(modelFaker.reviewTopic());
    roleA = modelFaker.role();
    roleB = modelFaker.role();
    roleC = modelFaker.role();
    roleD = modelFaker.role();
    a = roleA.id.value;
    b = roleB.id.value;
    c = roleC.id.value;
    d = roleD.id.value;
    project.peerReviews = PeerReviewCollection.fromMap(
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
      project.reviewTopics.first().id,
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
      const contributions = contributionsComputer.compute(project);
      expect(
        contributions.find((con) => con.roleId.equals(roleA.id))?.amount.value,
      ).toBeCloseTo(0.1);
      expect(
        contributions.find((con) => con.roleId.equals(roleB.id))?.amount.value,
      ).toBeCloseTo(0.2);
      expect(
        contributions.find((con) => con.roleId.equals(roleC.id))?.amount.value,
      ).toBeCloseTo(0.3);
      expect(
        contributions.find((con) => con.roleId.equals(roleD.id))?.amount.value,
      ).toBeCloseTo(0.4);
    });
  });
});
