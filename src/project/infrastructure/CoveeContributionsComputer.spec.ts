import { CoveeContributionsComputer } from 'project/infrastructure/CoveeContributionsComputer';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { InternalProject } from 'project/domain/project/Project';
import { UserId } from 'user/domain/value-objects/UserId';
import { Role } from 'project/domain/role/Role';
import { UnitTestScenario } from 'test/UnitTestScenario';

describe(CoveeContributionsComputer.name, () => {
  let scenario: UnitTestScenario<CoveeContributionsComputer>;
  let contributionsComputer: CoveeContributionsComputer;
  let role1: Role;
  let role2: Role;
  let role3: Role;
  let role4: Role;
  let role5: Role;
  let role6: Role;
  let role7: Role;
  let role8: Role;
  let a: string;
  let b: string;
  let c: string;
  let d: string;
  let e: string;
  let f: string;
  let g: string;
  let h: string;
  let project3: InternalProject;
  let project3a: InternalProject;
  let project3b: InternalProject;
  let project3c: InternalProject;
  let project3d: InternalProject;
  let project4: InternalProject;
  let project4a: InternalProject;
  let project4b: InternalProject;
  let project4c: InternalProject;
  let project5a: InternalProject;
  let project5b: InternalProject;
  let project7: InternalProject;
  let project8: InternalProject;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(
      CoveeContributionsComputer,
    ).build();
    contributionsComputer = scenario.subject;

    project3 = scenario.modelFaker.project(UserId.create());
    project3a = scenario.modelFaker.project(UserId.create());
    project3b = scenario.modelFaker.project(UserId.create());
    project3c = scenario.modelFaker.project(UserId.create());
    project3d = scenario.modelFaker.project(UserId.create());
    project4 = scenario.modelFaker.project(UserId.create());
    project4a = scenario.modelFaker.project(UserId.create());
    project4b = scenario.modelFaker.project(UserId.create());
    project4c = scenario.modelFaker.project(UserId.create());
    project5a = scenario.modelFaker.project(UserId.create());
    project5b = scenario.modelFaker.project(UserId.create());
    project7 = scenario.modelFaker.project(UserId.create());
    project8 = scenario.modelFaker.project(UserId.create());
    project3.reviewTopics.add(scenario.modelFaker.reviewTopic());
    project3a.reviewTopics.add(scenario.modelFaker.reviewTopic());
    project3b.reviewTopics.add(scenario.modelFaker.reviewTopic());
    project3c.reviewTopics.add(scenario.modelFaker.reviewTopic());
    project3d.reviewTopics.add(scenario.modelFaker.reviewTopic());
    project4.reviewTopics.add(scenario.modelFaker.reviewTopic());
    project4a.reviewTopics.add(scenario.modelFaker.reviewTopic());
    project4b.reviewTopics.add(scenario.modelFaker.reviewTopic());
    project4c.reviewTopics.add(scenario.modelFaker.reviewTopic());
    project5a.reviewTopics.add(scenario.modelFaker.reviewTopic());
    project5b.reviewTopics.add(scenario.modelFaker.reviewTopic());
    project7.reviewTopics.add(scenario.modelFaker.reviewTopic());
    project8.reviewTopics.add(scenario.modelFaker.reviewTopic());
    role1 = scenario.modelFaker.role();
    role2 = scenario.modelFaker.role();
    role3 = scenario.modelFaker.role();
    role4 = scenario.modelFaker.role();
    role5 = scenario.modelFaker.role();
    role6 = scenario.modelFaker.role();
    role7 = scenario.modelFaker.role();
    role8 = scenario.modelFaker.role();
    a = role1.id.value;
    b = role2.id.value;
    c = role3.id.value;
    d = role4.id.value;
    e = role5.id.value;
    f = role6.id.value;
    g = role7.id.value;
    h = role8.id.value;
  });

  describe('n=3', () => {
    test('equal split', () => {
      project3.peerReviews = PeerReviewCollection.fromMap(
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
        project3.reviewTopics.first().id,
      );
      const contributions = contributionsComputer.compute(project3);
      expect(
        contributions.find((con) => con.roleId.equals(role1.id))?.amount.value,
      ).toBeCloseTo(1 / 3);
      expect(
        contributions.find((con) => con.roleId.equals(role2.id))?.amount.value,
      ).toBeCloseTo(1 / 3);
      expect(
        contributions.find((con) => con.roleId.equals(role3.id))?.amount.value,
      ).toBeCloseTo(1 / 3);
    });
  });

  describe('n=3', () => {
    test('example 3a', () => {
      project3a.peerReviews = PeerReviewCollection.fromMap(
        {
          [a]: {
            [b]: 70.0 / 100,
            [c]: 30.0 / 100,
          },
          [b]: {
            [a]: 67.7 / 100,
            [c]: 32.1 / 100,
          },
          [c]: {
            [a]: 50.0 / 100,
            [b]: 50.0 / 100,
          },
        },
        project3a.reviewTopics.first().id,
      );
      const contributions = contributionsComputer.compute(project3a);
      expect(
        contributions.find((con) => con.roleId.equals(role1.id))?.amount.value,
      ).toBeCloseTo(0.404305502203859);
      expect(
        contributions.find((con) => con.roleId.equals(role2.id))?.amount.value,
      ).toBeCloseTo(0.41189347583111);
      expect(
        contributions.find((con) => con.roleId.equals(role3.id))?.amount.value,
      ).toBeCloseTo(0.183801021965031);
    });
  });

  describe('n=3', () => {
    test('example 3b', () => {
      project3b.peerReviews = PeerReviewCollection.fromMap(
        {
          [a]: {
            [b]: 50.0 / 100,
            [c]: 50.0 / 100,
          },
          [b]: {
            [a]: 50.0 / 100,
            [c]: 50.0 / 100,
          },
          [c]: {
            [a]: 58.7 / 100,
            [b]: 41.3 / 100,
          },
        },
        project3b.reviewTopics.first().id,
      );
      const contributions = contributionsComputer.compute(project3b);
      expect(
        contributions.find((con) => con.roleId.equals(role1.id))?.amount.value,
      ).toBeCloseTo(0.371552438944085);
      expect(
        contributions.find((con) => con.roleId.equals(role2.id))?.amount.value,
      ).toBeCloseTo(0.293607288140377);
      expect(
        contributions.find((con) => con.roleId.equals(role3.id))?.amount.value,
      ).toBeCloseTo(0.334840272915538);
    });
  });

  // NOTE: results significantly differ from DVSN app
  //       since we are using a different formula
  //       for calculating matrix S5, compare Matlab code
  describe('n=3', () => {
    test('example 3c', () => {
      project3c.peerReviews = PeerReviewCollection.fromMap(
        {
          [a]: {
            [b]: 12.0 / 100,
            [c]: 88.0 / 100,
          },
          [b]: {
            [a]: 57.3 / 100,
            [c]: 42.7 / 100,
          },
          [c]: {
            [a]: 40.8 / 100,
            [b]: 59.2 / 100,
          },
        },
        project3c.reviewTopics.first().id,
      );
      const contributions = contributionsComputer.compute(project3c);
      expect(
        contributions.find((con) => con.roleId.equals(role1.id))?.amount.value,
      ).toBeCloseTo(0.3782262990133);
      expect(
        contributions.find((con) => con.roleId.equals(role2.id))?.amount.value,
      ).toBeCloseTo(0.133984674653792);
      expect(
        contributions.find((con) => con.roleId.equals(role3.id))?.amount.value,
      ).toBeCloseTo(0.487789026332909);
    });
  });

  // NOTE: results significantly differ from DVSN app
  //       since we are using a different formula
  //       for calculating matrix S5, compare Matlab code
  describe('n=3', () => {
    test('example 3d', () => {
      project3d.peerReviews = PeerReviewCollection.fromMap(
        {
          [a]: {
            [b]: 45.2 / 100,
            [c]: 54.8 / 100,
          },
          [b]: {
            [a]: 28.3 / 100,
            [c]: 71.7 / 100,
          },
          [c]: {
            [a]: 78.2 / 100,
            [b]: 21.8 / 100,
          },
        },
        project3d.reviewTopics.first().id,
      );
      const contributions = contributionsComputer.compute(project3d);
      expect(
        contributions.find((con) => con.roleId.equals(role1.id))?.amount.value,
      ).toBeCloseTo(0.296296665603337);
      expect(
        contributions.find((con) => con.roleId.equals(role2.id))?.amount.value,
      ).toBeCloseTo(0.194771131762688);
      expect(
        contributions.find((con) => con.roleId.equals(role3.id))?.amount.value,
      ).toBeCloseTo(0.508932202633975);
    });
  });

  describe('n=4', () => {
    test('whitepaper example', () => {
      project4.peerReviews = PeerReviewCollection.fromMap(
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
        project4.reviewTopics.first().id,
      );
      const contributions = contributionsComputer.compute(project4);
      expect(
        contributions.find((con) => con.roleId.equals(role1.id))?.amount.value,
      ).toBeCloseTo(0.1);
      expect(
        contributions.find((con) => con.roleId.equals(role2.id))?.amount.value,
      ).toBeCloseTo(0.2);
      expect(
        contributions.find((con) => con.roleId.equals(role3.id))?.amount.value,
      ).toBeCloseTo(0.3);
      expect(
        contributions.find((con) => con.roleId.equals(role4.id))?.amount.value,
      ).toBeCloseTo(0.4);
    });
  });

  describe('n=4', () => {
    test('example 4a', () => {
      project4a.peerReviews = PeerReviewCollection.fromMap(
        {
          [c]: {
            [a]: 32.5 / 100,
            [b]: 31.3 / 100,
            [d]: 36.2 / 100,
          },
          [a]: {
            [b]: 33.0 / 99,
            [c]: 33.0 / 99,
            [d]: 33.0 / 99,
          },
          [b]: {
            [a]: 33.0 / 99,
            [c]: 33.0 / 99,
            [d]: 33.0 / 99,
          },
          [d]: {
            [a]: 34.1 / 100,
            [b]: 33.8 / 100,
            [c]: 32.1 / 100,
          },
        },
        project4a.reviewTopics.first().id,
      );
      const contributions = contributionsComputer.compute(project4a);
      expect(
        contributions.find((con) => con.roleId.equals(role1.id))?.amount.value,
      ).toBeCloseTo(0.249985782136071);
      expect(
        contributions.find((con) => con.roleId.equals(role2.id))?.amount.value,
      ).toBeCloseTo(0.245605602838321);
      expect(
        contributions.find((con) => con.roleId.equals(role3.id))?.amount.value,
      ).toBeCloseTo(0.246498973926039);
      expect(
        contributions.find((con) => con.roleId.equals(role4.id))?.amount.value,
      ).toBeCloseTo(0.25790964109957);
    });
  });

  describe('n=4', () => {
    test('example 4b', () => {
      project4b.peerReviews = PeerReviewCollection.fromMap(
        {
          [a]: {
            [b]: 33.3 / 100,
            [c]: 33.4 / 100,
            [d]: 32.2 / 100,
          },
          [b]: {
            [a]: 50.0 / 100,
            [c]: 50.0 / 100,
            [d]: 0.0 / 100,
          },
          [c]: {
            [a]: 0.0 / 100,
            [b]: 45.9 / 100,
            [d]: 54.1 / 100,
          },
          [d]: {
            [a]: 0.0 / 100,
            [b]: 51.0 / 100,
            [c]: 49.0 / 100,
          },
        },
        project4b.reviewTopics.first().id,
      );
      const contributions = contributionsComputer.compute(project4b);
      expect(
        contributions.find((con) => con.roleId.equals(role1.id))?.amount.value,
      ).toBeCloseTo(0.071974230896154);
      expect(
        contributions.find((con) => con.roleId.equals(role2.id))?.amount.value,
      ).toBeCloseTo(0.327948241927373);
      expect(
        contributions.find((con) => con.roleId.equals(role3.id))?.amount.value,
      ).toBeCloseTo(0.419282649048772);
      expect(
        contributions.find((con) => con.roleId.equals(role4.id))?.amount.value,
      ).toBeCloseTo(0.180794878127702);
    });
  });

  describe('n=4', () => {
    test('example 4c', () => {
      project4c.peerReviews = PeerReviewCollection.fromMap(
        {
          [d]: {
            [a]: 21.0 / 100,
            [b]: 39.5 / 100,
            [c]: 39.5 / 100,
          },
          [b]: {
            [a]: 31.7 / 100,
            [c]: 39.2 / 100,
            [d]: 29.1 / 100,
          },
          [a]: {
            [b]: 34.5 / 100,
            [c]: 33.3 / 100,
            [d]: 32.2 / 100,
          },
          [c]: {
            [a]: 31.7 / 100,
            [b]: 40.3 / 100,
            [d]: 28.0 / 100,
          },
        },
        project4c.reviewTopics.first().id,
      );
      const contributions = contributionsComputer.compute(project4c);
      expect(
        contributions.find((con) => con.roleId.equals(role1.id))?.amount.value,
      ).toBeCloseTo(0.20133325281712);
      expect(
        contributions.find((con) => con.roleId.equals(role2.id))?.amount.value,
      ).toBeCloseTo(0.292719262778615);
      expect(
        contributions.find((con) => con.roleId.equals(role3.id))?.amount.value,
      ).toBeCloseTo(0.285300789544696);
      expect(
        contributions.find((con) => con.roleId.equals(role4.id))?.amount.value,
      ).toBeCloseTo(0.22064669485957);
    });
  });

  describe('n=5', () => {
    test('example 5a', () => {
      project5a.peerReviews = PeerReviewCollection.fromMap(
        {
          [a]: {
            [b]: 20.0 / 100,
            [c]: 32.0 / 100,
            [d]: 25.0 / 100,
            [e]: 23.0 / 100,
          },
          [e]: {
            [a]: 35.0 / 100,
            [b]: 20.0 / 100,
            [c]: 25.0 / 100,
            [d]: 20.0 / 100,
          },
          [b]: {
            [a]: 25.6 / 100,
            [c]: 24.4 / 100,
            [d]: 24.4 / 100,
            [e]: 25.6 / 100,
          },
          [c]: {
            [a]: 25.0 / 100,
            [b]: 25.0 / 100,
            [d]: 25.0 / 100,
            [e]: 25.0 / 100,
          },
          [d]: {
            [a]: 29.4 / 100,
            [b]: 22.1 / 100,
            [c]: 26.5 / 100,
            [e]: 22.0 / 100,
          },
        },
        project5a.reviewTopics.first().id,
      );
      const contributions = contributionsComputer.compute(project5a);
      expect(
        contributions.find((con) => con.roleId.equals(role1.id))?.amount.value,
      ).toBeCloseTo(0.229976858084333);
      expect(
        contributions.find((con) => con.roleId.equals(role2.id))?.amount.value,
      ).toBeCloseTo(0.173493919035586);
      expect(
        contributions.find((con) => con.roleId.equals(role3.id))?.amount.value,
      ).toBeCloseTo(0.216264975211579);
      expect(
        contributions.find((con) => con.roleId.equals(role4.id))?.amount.value,
      ).toBeCloseTo(0.189085366606353);
      expect(
        contributions.find((con) => con.roleId.equals(role5.id))?.amount.value,
      ).toBeCloseTo(0.19117888106215);
    });
  });

  describe('n=5', () => {
    test('example 5b', () => {
      project5b.peerReviews = PeerReviewCollection.fromMap(
        {
          [a]: {
            [b]: 40.0 / 100,
            [c]: 40.0 / 100,
            [d]: 20.0 / 100,
            [e]: 0.0 / 100,
          },
          [b]: {
            [a]: 35.0 / 100,
            [c]: 40.0 / 100,
            [d]: 20.0 / 100,
            [e]: 5.0 / 100,
          },
          [c]: {
            [a]: 43.9 / 100,
            [b]: 30.5 / 100,
            [d]: 25.6 / 100,
            [e]: 0.0 / 100,
          },
          [d]: {
            [a]: 33.3 / 100,
            [b]: 33.3 / 100,
            [c]: 33.4 / 100,
            [e]: 0.0 / 100,
          },
          [e]: {
            [a]: 25.0 / 100,
            [b]: 25.0 / 100,
            [c]: 25.0 / 100,
            [d]: 25.0 / 100,
          },
        },
        project5b.reviewTopics.first().id,
      );
      const contributions = contributionsComputer.compute(project5b);
      expect(
        contributions.find((con) => con.roleId.equals(role1.id))?.amount.value,
      ).toBeCloseTo(0.275094933116376);
      expect(
        contributions.find((con) => con.roleId.equals(role2.id))?.amount.value,
      ).toBeCloseTo(0.258285318151162);
      expect(
        contributions.find((con) => con.roleId.equals(role3.id))?.amount.value,
      ).toBeCloseTo(0.278703022635355);
      expect(
        contributions.find((con) => con.roleId.equals(role4.id))?.amount.value,
      ).toBeCloseTo(0.184462175160944);
      expect(
        contributions.find((con) => con.roleId.equals(role5.id))?.amount.value,
      ).toBeCloseTo(0.00345455093616235);
    });
  });

  describe('n=7', () => {
    test('example 7', () => {
      project7.peerReviews = PeerReviewCollection.fromMap(
        {
          [g]: {
            [a]: 18.8 / 100,
            [b]: 19.2 / 100,
            [c]: 16.6 / 100,
            [d]: 17.7 / 100,
            [e]: 16.6 / 100,
            [f]: 11.1 / 100,
          },
          [a]: {
            [b]: 20.9 / 100,
            [c]: 16.7 / 100,
            [d]: 18.3 / 100,
            [e]: 16.7 / 100,
            [f]: 10.7 / 100,
            [g]: 16.7 / 100,
          },
          [b]: {
            [a]: 19.9 / 100,
            [c]: 16.1 / 100,
            [d]: 16.0 / 100,
            [e]: 16.0 / 100,
            [f]: 16.0 / 100,
            [g]: 16.0 / 100,
          },
          [e]: {
            [a]: 22.4 / 100,
            [b]: 22.4 / 100,
            [c]: 14.9 / 100,
            [d]: 18.0 / 100,
            [f]: 7.4 / 100,
            [g]: 14.9 / 100,
          },
          [c]: {
            [a]: 19.1 / 100,
            [b]: 34.3 / 100,
            [d]: 14.7 / 100,
            [e]: 11.1 / 100,
            [f]: 8.9 / 100,
            [g]: 11.9 / 100,
          },
          [d]: {
            [a]: 24.0 / 100,
            [b]: 20.0 / 100,
            [c]: 12.1 / 100,
            [e]: 20.1 / 100,
            [f]: 7.5 / 100,
            [g]: 16.3 / 100,
          },
          [f]: {
            [a]: 16.0 / 96,
            [b]: 16.0 / 96,
            [c]: 16.0 / 96,
            [d]: 16.0 / 96,
            [e]: 16.0 / 96,
            [g]: 16.0 / 96,
          },
        },
        project7.reviewTopics.first().id,
      );
      const contributions = contributionsComputer.compute(project7);
      expect(
        contributions.find((con) => con.roleId.equals(role1.id))?.amount.value,
      ).toBeCloseTo(0.175554568961258);
      expect(
        contributions.find((con) => con.roleId.equals(role2.id))?.amount.value,
      ).toBeCloseTo(0.186336537644647);
      expect(
        contributions.find((con) => con.roleId.equals(role3.id))?.amount.value,
      ).toBeCloseTo(0.132977443251899);
      expect(
        contributions.find((con) => con.roleId.equals(role4.id))?.amount.value,
      ).toBeCloseTo(0.147541175675117);
      expect(
        contributions.find((con) => con.roleId.equals(role5.id))?.amount.value,
      ).toBeCloseTo(0.138486341447312);
      expect(
        contributions.find((con) => con.roleId.equals(role6.id))?.amount.value,
      ).toBeCloseTo(0.0849053679415465);
      expect(
        contributions.find((con) => con.roleId.equals(role7.id))?.amount.value,
      ).toBeCloseTo(0.134198565078221);
    });
  });

  describe('n=7', () => {
    test('example 7', () => {
      project8.peerReviews = PeerReviewCollection.fromMap(
        {
          [e]: {
            [a]: 14.3 / 100,
            [b]: 14.5 / 100,
            [c]: 14.3 / 100,
            [d]: 14.3 / 100,
            [f]: 14.3 / 100,
            [g]: 14.0 / 100,
            [h]: 14.3 / 100,
          },
          [c]: {
            [a]: 18.8 / 100,
            [b]: 14.4 / 100,
            [d]: 14.2 / 100,
            [e]: 14.2 / 100,
            [f]: 14.2 / 100,
            [g]: 12.1 / 100,
            [h]: 12.1 / 100,
          },
          [a]: {
            [b]: 13.7 / 100,
            [c]: 14.7 / 100,
            [d]: 14.4 / 100,
            [e]: 14.7 / 100,
            [f]: 14.0 / 100,
            [g]: 14.1 / 100,
            [h]: 14.4 / 100,
          },
          [h]: {
            [a]: 18.1 / 100,
            [b]: 14.0 / 100,
            [c]: 14.0 / 100,
            [d]: 12.4 / 100,
            [e]: 15.6 / 100,
            [f]: 14.5 / 100,
            [g]: 11.4 / 100,
          },
          [f]: {
            [a]: 14.3 / 100,
            [b]: 14.3 / 100,
            [c]: 14.3 / 100,
            [d]: 14.2 / 100,
            [e]: 14.3 / 100,
            [g]: 14.3 / 100,
            [h]: 14.3 / 100,
          },
          [g]: {
            [a]: 14.3 / 100,
            [b]: 14.3 / 100,
            [c]: 14.3 / 100,
            [d]: 14.3 / 100,
            [e]: 14.3 / 100,
            [f]: 14.3 / 100,
            [h]: 14.2 / 100,
          },
          [b]: {
            [a]: 14.0 / 98,
            [c]: 14.0 / 98,
            [d]: 14.0 / 98,
            [e]: 14.0 / 98,
            [f]: 14.0 / 98,
            [g]: 14.0 / 98,
            [h]: 14.0 / 98,
          },
          [d]: {
            [a]: 14.0 / 98,
            [b]: 14.0 / 98,
            [c]: 14.0 / 98,
            [e]: 14.0 / 98,
            [f]: 14.0 / 98,
            [g]: 14.0 / 98,
            [h]: 14.0 / 98,
          },
        },
        project8.reviewTopics.first().id,
      );
      const contributions = contributionsComputer.compute(project8);
      expect(
        contributions.find((con) => con.roleId.equals(role1.id))?.amount.value,
      ).toBeCloseTo(0.134368884210153);
      expect(
        contributions.find((con) => con.roleId.equals(role2.id))?.amount.value,
      ).toBeCloseTo(0.124806151901986);
      expect(
        contributions.find((con) => con.roleId.equals(role3.id))?.amount.value,
      ).toBeCloseTo(0.125499383465628);
      expect(
        contributions.find((con) => con.roleId.equals(role4.id))?.amount.value,
      ).toBeCloseTo(0.122756343375474);
      expect(
        contributions.find((con) => con.roleId.equals(role5.id))?.amount.value,
      ).toBeCloseTo(0.12751680941521);
      expect(
        contributions.find((con) => con.roleId.equals(role6.id))?.amount.value,
      ).toBeCloseTo(0.125327647462686);
      expect(
        contributions.find((con) => con.roleId.equals(role7.id))?.amount.value,
      ).toBeCloseTo(0.117560941100933);
      expect(
        contributions.find((con) => con.roleId.equals(role8.id))?.amount.value,
      ).toBeCloseTo(0.12216383906793);
    });
  });
});
