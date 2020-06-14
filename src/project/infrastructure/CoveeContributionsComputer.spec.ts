import { CoveeContributionsComputer } from 'project/infrastructure/CoveeContributionsComputer';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { InternalProject } from 'project/domain/project/Project';
import { UserId } from 'user/domain/value-objects/UserId';
import { Role } from 'project/domain/role/Role';
import { UnitTestScenario } from 'test/UnitTestScenario';

describe(CoveeContributionsComputer.name, () => {
  let scenario: UnitTestScenario<CoveeContributionsComputer>;
  let contributionsComputer: CoveeContributionsComputer;
  let roleA: Role;
  let roleB: Role;
  let roleC: Role;
  let a: string;
  let b: string;
  let c: string;
  let project: InternalProject;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(
      CoveeContributionsComputer,
    ).build();
    contributionsComputer = scenario.subject;
    project = scenario.modelFaker.project(UserId.create());
    project.reviewTopics.add(scenario.modelFaker.reviewTopic());
    roleA = scenario.modelFaker.role();
    roleB = scenario.modelFaker.role();
    roleC = scenario.modelFaker.role();
    a = roleA.id.value;
    b = roleB.id.value;
    c = roleC.id.value;
  });

  describe('n=3', () => {
    test('equal split', () => {
      project.peerReviews = PeerReviewCollection.fromMap(
        {
          [a]: {
            [b]: 1 / 2,
            [c]: 1 / 2,
          },
          [b]: {
            [a]: 1 / 2,
            [c]: 1 / 2,
          },
          [c]: {
            [a]: 1 / 2,
            [b]: 1 / 2,
          },
        },
        project.reviewTopics.first().id,
      );
      const contributions = contributionsComputer.compute(project);
      expect(
        contributions.find((con) => con.roleId.equals(roleA.id))?.amount.value,
      ).toBeCloseTo(1 / 3);
      expect(
        contributions.find((con) => con.roleId.equals(roleB.id))?.amount.value,
      ).toBeCloseTo(1 / 3);
      expect(
        contributions.find((con) => con.roleId.equals(roleC.id))?.amount.value,
      ).toBeCloseTo(1 / 3);
    });
  });

  describe('n=4', () => {
    let roleD: Role;
    let d: string;

    beforeEach(() => {
      roleD = scenario.modelFaker.role();
      d = roleD.id.value;
    });

    test('whitepaper example', () => {
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
