import { CoveeContributionsComputer } from 'project/infrastructure/CoveeContributionsComputer';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { InternalProject } from 'project/domain/project/Project';
import { UserId } from 'user/domain/value-objects/UserId';
import { Role } from 'project/domain/role/Role';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';

describe(CoveeContributionsComputer.name, () => {
  let scenario: UnitTestScenario<CoveeContributionsComputer>;
  let contributionsComputer: CoveeContributionsComputer;
  let project: InternalProject;
  let reviewTopic: ReviewTopic;
  let roles: Role[];

  const strToInt = (s: string): number => Buffer.from(s)[0] - 97;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(
      CoveeContributionsComputer,
    ).build();
    contributionsComputer = scenario.subject;

    project = scenario.modelFaker.project(UserId.create());

    reviewTopic = scenario.modelFaker.reviewTopic();
    project.reviewTopics.add(reviewTopic);
    roles = [];
    for (let i = 0; i < 10; i++) {
      roles.push(scenario.modelFaker.role());
    }
  });

  interface Case {
    title: string;
    peerReviews: Record<string, Record<string, number>>;
    results: Record<string, number>;
  }

  const cases: Case[] = [
    {
      title: 'n=3 equal split',
      peerReviews: {
        a: {
          b: 1 / 2,
          c: 1 / 2,
        },
        b: {
          a: 1 / 2,
          c: 1 / 2,
        },
        c: {
          a: 1 / 2,
          b: 1 / 2,
        },
      },
      results: {
        a: 1 / 3,
        b: 1 / 3,
        c: 1 / 3,
      },
    },
    {
      title: '3a',
      peerReviews: {
        a: {
          b: 70.0 / 100,
          c: 30.0 / 100,
        },
        b: {
          a: 67.7 / 100,
          c: 32.1 / 100,
        },
        c: {
          a: 50.0 / 100,
          b: 50.0 / 100,
        },
      },
      results: {
        a: 0.404305502203859,
        b: 0.41189347583111,
        c: 0.183801021965031,
      },
    },
    {
      title: '3b',
      peerReviews: {
        a: {
          b: 50.0 / 100,
          c: 50.0 / 100,
        },
        b: {
          a: 50.0 / 100,
          c: 50.0 / 100,
        },
        c: {
          a: 58.7 / 100,
          b: 41.3 / 100,
        },
      },
      results: {
        a: 0.371552438944085,
        b: 0.293607288140377,
        c: 0.334840272915538,
      },
    },
    {
      // NOTE: results significantly differ from DVSN app
      //       since we are using a different formula
      //       for calculating matrix S5, compare Matlab code
      title: '3c',
      peerReviews: {
        a: {
          b: 12.0 / 100,
          c: 88.0 / 100,
        },
        b: {
          a: 57.3 / 100,
          c: 42.7 / 100,
        },
        c: {
          a: 40.8 / 100,
          b: 59.2 / 100,
        },
      },
      results: {
        a: 0.3782262990133,
        b: 0.133984674653792,
        c: 0.487789026332909,
      },
    },
    {
      // NOTE: results significantly differ from DVSN app
      //       since we are using a different formula
      //       for calculating matrix S5, compare Matlab code
      title: '3d',
      peerReviews: {
        a: {
          b: 45.2 / 100,
          c: 54.8 / 100,
        },
        b: {
          a: 28.3 / 100,
          c: 71.7 / 100,
        },
        c: {
          a: 78.2 / 100,
          b: 21.8 / 100,
        },
      },
      results: {
        a: 0.296296665603337,
        b: 0.194771131762688,
        c: 0.508932202633975,
      },
    },
    {
      title: '3e',
      peerReviews: {
        a: {
          b: Number.MAX_VALUE,
          c: 0,
        },
        b: {
          a: 0,
          c: Number.MAX_VALUE,
        },
        c: {
          a: Number.MAX_VALUE,
          b: 0,
        },
      },
      results: {
        a: 1 / 3,
        b: 1 / 3,
        c: 1 / 3,
      },
    },
    {
      title: '4 whitepaper example',
      peerReviews: {
        a: {
          b: 20 / 90,
          c: 30 / 90,
          d: 40 / 90,
        },
        b: {
          a: 10 / 80,
          c: 30 / 80,
          d: 40 / 80,
        },
        c: {
          a: 10 / 70,
          b: 20 / 70,
          d: 40 / 70,
        },
        d: {
          a: 10 / 60,
          b: 20 / 60,
          c: 30 / 60,
        },
      },
      results: {
        a: 0.1,
        b: 0.2,
        c: 0.3,
        d: 0.4,
      },
    },
    {
      title: '4a',
      peerReviews: {
        c: {
          a: 32.5 / 100,
          b: 31.3 / 100,
          d: 36.2 / 100,
        },
        a: {
          b: 33.0 / 99,
          c: 33.0 / 99,
          d: 33.0 / 99,
        },
        b: {
          a: 33.0 / 99,
          c: 33.0 / 99,
          d: 33.0 / 99,
        },
        d: {
          a: 34.1 / 100,
          b: 33.8 / 100,
          c: 32.1 / 100,
        },
      },
      results: {
        a: 0.249985782136071,
        b: 0.245605602838321,
        c: 0.246498973926039,
        d: 0.25790964109957,
      },
    },
    {
      title: '4b',
      peerReviews: {
        a: {
          b: 33.3 / 100,
          c: 33.4 / 100,
          d: 32.2 / 100,
        },
        b: {
          a: 50.0 / 100,
          c: 50.0 / 100,
          d: 0.0 / 100,
        },
        c: {
          a: 0.0 / 100,
          b: 45.9 / 100,
          d: 54.1 / 100,
        },
        d: {
          a: 0.0 / 100,
          b: 51.0 / 100,
          c: 49.0 / 100,
        },
      },
      results: {
        a: 0.071974230896154,
        b: 0.327948241927373,
        c: 0.419282649048772,
        d: 0.180794878127702,
      },
    },
    {
      title: '4c',
      peerReviews: {
        d: {
          a: 21.0 / 100,
          b: 39.5 / 100,
          c: 39.5 / 100,
        },
        b: {
          a: 31.7 / 100,
          c: 39.2 / 100,
          d: 29.1 / 100,
        },
        a: {
          b: 34.5 / 100,
          c: 33.3 / 100,
          d: 32.2 / 100,
        },
        c: {
          a: 31.7 / 100,
          b: 40.3 / 100,
          d: 28.0 / 100,
        },
      },
      results: {
        a: 0.20133325281712,
        b: 0.292719262778615,
        c: 0.285300789544696,
        d: 0.22064669485957,
      },
    },
    {
      title: '4d',
      peerReviews: {
        a: {
          b: Number.MAX_VALUE,
          c: 0,
          d: 0,
        },
        b: {
          a: 0,
          c: Number.MAX_VALUE,
          d: 0,
        },
        c: {
          a: 0,
          b: 0,
          d: Number.MAX_VALUE,
        },
        d: {
          a: Number.MAX_VALUE,
          b: 0,
          c: 0,
        },
      },
      results: {
        a: 1 / 4,
        b: 1 / 4,
        c: 1 / 4,
        d: 1 / 4,
      },
    },
    {
      title: '5a',
      peerReviews: {
        a: {
          b: 20.0 / 100,
          c: 32.0 / 100,
          d: 25.0 / 100,
          e: 23.0 / 100,
        },
        e: {
          a: 35.0 / 100,
          b: 20.0 / 100,
          c: 25.0 / 100,
          d: 20.0 / 100,
        },
        b: {
          a: 25.6 / 100,
          c: 24.4 / 100,
          d: 24.4 / 100,
          e: 25.6 / 100,
        },
        c: {
          a: 25.0 / 100,
          b: 25.0 / 100,
          d: 25.0 / 100,
          e: 25.0 / 100,
        },
        d: {
          a: 29.4 / 100,
          b: 22.1 / 100,
          c: 26.5 / 100,
          e: 22.0 / 100,
        },
      },
      results: {
        a: 0.229976858084333,
        b: 0.173493919035586,
        c: 0.216264975211579,
        d: 0.189085366606353,
        e: 0.19117888106215,
      },
    },
    {
      title: '5b',
      peerReviews: {
        a: {
          b: 40.0 / 100,
          c: 40.0 / 100,
          d: 20.0 / 100,
          e: 0.0 / 100,
        },
        b: {
          a: 35.0 / 100,
          c: 40.0 / 100,
          d: 20.0 / 100,
          e: 5.0 / 100,
        },
        c: {
          a: 43.9 / 100,
          b: 30.5 / 100,
          d: 25.6 / 100,
          e: 0.0 / 100,
        },
        d: {
          a: 33.3 / 100,
          b: 33.3 / 100,
          c: 33.4 / 100,
          e: 0.0 / 100,
        },
        e: {
          a: 25.0 / 100,
          b: 25.0 / 100,
          c: 25.0 / 100,
          d: 25.0 / 100,
        },
      },
      results: {
        a: 0.275094933116376,
        b: 0.258285318151162,
        c: 0.278703022635355,
        d: 0.184462175160944,
        e: 0.00345455093616235,
      },
    },
    {
      title: '7a',
      peerReviews: {
        g: {
          a: 18.8 / 100,
          b: 19.2 / 100,
          c: 16.6 / 100,
          d: 17.7 / 100,
          e: 16.6 / 100,
          f: 11.1 / 100,
        },
        a: {
          b: 20.9 / 100,
          c: 16.7 / 100,
          d: 18.3 / 100,
          e: 16.7 / 100,
          f: 10.7 / 100,
          g: 16.7 / 100,
        },
        b: {
          a: 19.9 / 100,
          c: 16.1 / 100,
          d: 16.0 / 100,
          e: 16.0 / 100,
          f: 16.0 / 100,
          g: 16.0 / 100,
        },
        e: {
          a: 22.4 / 100,
          b: 22.4 / 100,
          c: 14.9 / 100,
          d: 18.0 / 100,
          f: 7.4 / 100,
          g: 14.9 / 100,
        },
        c: {
          a: 19.1 / 100,
          b: 34.3 / 100,
          d: 14.7 / 100,
          e: 11.1 / 100,
          f: 8.9 / 100,
          g: 11.9 / 100,
        },
        d: {
          a: 24.0 / 100,
          b: 20.0 / 100,
          c: 12.1 / 100,
          e: 20.1 / 100,
          f: 7.5 / 100,
          g: 16.3 / 100,
        },
        f: {
          a: 16.0 / 96,
          b: 16.0 / 96,
          c: 16.0 / 96,
          d: 16.0 / 96,
          e: 16.0 / 96,
          g: 16.0 / 96,
        },
      },
      results: {
        a: 0.175554568961258,
        b: 0.186336537644647,
        c: 0.132977443251899,
        d: 0.147541175675117,
        e: 0.138486341447312,
        f: 0.0849053679415465,
        g: 0.134198565078221,
      },
    },
    {
      title: '8a',
      peerReviews: {
        e: {
          a: 14.3 / 100,
          b: 14.5 / 100,
          c: 14.3 / 100,
          d: 14.3 / 100,
          f: 14.3 / 100,
          g: 14.0 / 100,
          h: 14.3 / 100,
        },
        c: {
          a: 18.8 / 100,
          b: 14.4 / 100,
          d: 14.2 / 100,
          e: 14.2 / 100,
          f: 14.2 / 100,
          g: 12.1 / 100,
          h: 12.1 / 100,
        },
        a: {
          b: 13.7 / 100,
          c: 14.7 / 100,
          d: 14.4 / 100,
          e: 14.7 / 100,
          f: 14.0 / 100,
          g: 14.1 / 100,
          h: 14.4 / 100,
        },
        h: {
          a: 18.1 / 100,
          b: 14.0 / 100,
          c: 14.0 / 100,
          d: 12.4 / 100,
          e: 15.6 / 100,
          f: 14.5 / 100,
          g: 11.4 / 100,
        },
        f: {
          a: 14.3 / 100,
          b: 14.3 / 100,
          c: 14.3 / 100,
          d: 14.2 / 100,
          e: 14.3 / 100,
          g: 14.3 / 100,
          h: 14.3 / 100,
        },
        g: {
          a: 14.3 / 100,
          b: 14.3 / 100,
          c: 14.3 / 100,
          d: 14.3 / 100,
          e: 14.3 / 100,
          f: 14.3 / 100,
          h: 14.2 / 100,
        },
        b: {
          a: 14.0 / 98,
          c: 14.0 / 98,
          d: 14.0 / 98,
          e: 14.0 / 98,
          f: 14.0 / 98,
          g: 14.0 / 98,
          h: 14.0 / 98,
        },
        d: {
          a: 14.0 / 98,
          b: 14.0 / 98,
          c: 14.0 / 98,
          e: 14.0 / 98,
          f: 14.0 / 98,
          g: 14.0 / 98,
          h: 14.0 / 98,
        },
      },
      results: {
        a: 0.134368884210153,
        b: 0.124806151901986,
        c: 0.125499383465628,
        d: 0.122756343375474,
        e: 0.12751680941521,
        f: 0.125327647462686,
        g: 0.117560941100933,
        h: 0.12216383906793,
      },
    },
    {
      title: '8b',
      peerReviews: {
        a: {
          b: Number.MAX_VALUE,
          c: 0,
          d: 0,
          e: 0,
          f: 0,
          g: 0,
          h: 0,
        },
        b: {
          a: 0,
          c: Number.MAX_VALUE,
          d: 0,
          e: 0,
          f: 0,
          g: 0,
          h: 0,
        },
        c: {
          a: 0,
          b: 0,
          d: Number.MAX_VALUE,
          e: 0,
          f: 0,
          g: 0,
          h: 0,
        },
        d: {
          a: 0,
          b: 0,
          c: 0,
          e: Number.MAX_VALUE,
          f: 0,
          g: 0,
          h: 0,
        },
        e: {
          a: 0,
          b: 0,
          c: 0,
          d: 0,
          f: Number.MAX_VALUE,
          g: 0,
          h: 0,
        },
        f: {
          a: 0,
          b: 0,
          c: 0,
          d: 0,
          e: 0,
          g: Number.MAX_VALUE,
          h: 0,
        },
        g: {
          a: 0,
          b: 0,
          c: 0,
          d: 0,
          e: 0,
          f: 0,
          h: Number.MAX_VALUE,
        },
        h: {
          a: Number.MAX_SAFE_INTEGER,
          b: 0,
          c: 0,
          d: 0,
          e: 0,
          f: 0,
          g: 0,
        },
      },
      results: {
        a: 1 / 8,
        b: 1 / 8,
        c: 1 / 8,
        d: 1 / 8,
        e: 1 / 8,
        f: 1 / 8,
        g: 1 / 8,
        h: 1 / 8,
      },
    },
    {
      title: '8c',
      peerReviews: {
        a: {
          b: Number.MAX_VALUE,
          c: Number.MAX_VALUE,
          d: Number.MAX_VALUE,
          e: Number.MAX_VALUE,
          f: Number.MAX_VALUE,
          g: Number.MAX_VALUE,
          h: Number.MAX_VALUE,
        },
        b: {
          a: Number.MAX_VALUE,
          c: Number.MAX_VALUE,
          d: Number.MAX_VALUE,
          e: Number.MAX_VALUE,
          f: Number.MAX_VALUE,
          g: Number.MAX_VALUE,
          h: Number.MAX_VALUE,
        },
        c: {
          a: Number.MAX_VALUE,
          b: Number.MAX_VALUE,
          d: Number.MAX_VALUE,
          e: Number.MAX_VALUE,
          f: Number.MAX_VALUE,
          g: Number.MAX_VALUE,
          h: Number.MAX_VALUE,
        },
        d: {
          a: Number.MAX_VALUE,
          b: Number.MAX_VALUE,
          c: Number.MAX_VALUE,
          e: Number.MAX_VALUE,
          f: Number.MAX_VALUE,
          g: Number.MAX_VALUE,
          h: Number.MAX_VALUE,
        },
        e: {
          a: Number.MAX_VALUE,
          b: Number.MAX_VALUE,
          c: Number.MAX_VALUE,
          d: Number.MAX_VALUE,
          f: Number.MAX_VALUE,
          g: Number.MAX_VALUE,
          h: Number.MAX_VALUE,
        },
        f: {
          a: Number.MAX_VALUE,
          b: Number.MAX_VALUE,
          c: Number.MAX_VALUE,
          d: Number.MAX_VALUE,
          e: Number.MAX_VALUE,
          g: Number.MAX_VALUE,
          h: Number.MAX_VALUE,
        },
        g: {
          a: Number.MAX_VALUE,
          b: Number.MAX_VALUE,
          c: Number.MAX_VALUE,
          d: Number.MAX_VALUE,
          e: Number.MAX_VALUE,
          f: Number.MAX_VALUE,
          h: Number.MAX_VALUE,
        },
        h: {
          a: Number.MAX_VALUE,
          b: Number.MAX_VALUE,
          c: Number.MAX_VALUE,
          d: Number.MAX_VALUE,
          e: Number.MAX_VALUE,
          f: Number.MAX_VALUE,
          g: Number.MAX_VALUE,
        },
      },
      results: {
        a: 1 / 8,
        b: 1 / 8,
        c: 1 / 8,
        d: 1 / 8,
        e: 1 / 8,
        f: 1 / 8,
        g: 1 / 8,
        h: 1 / 8,
      },
    },
  ];

  test.each(cases)(
    'covee contribution computer',
    ({ title, peerReviews: abcPeerReviewMap, results: abcResults }) => {
      const peerReviewMap: Record<string, Record<string, number>> = {};
      for (const [abcSender, abcReceivers] of Object.entries(
        abcPeerReviewMap,
      )) {
        const sender = roles[strToInt(abcSender)];
        peerReviewMap[sender.id.value] = {};
        for (const [abcReceiver, score] of Object.entries(abcReceivers)) {
          const receiver = roles[strToInt(abcReceiver)];
          peerReviewMap[sender.id.value][receiver.id.value] = score;
        }
      }
      project.peerReviews = PeerReviewCollection.ofMap(
        peerReviewMap,
        reviewTopic.id,
      );
      const contributions = contributionsComputer.compute(project);
      for (const [roleKey, expectedContribution] of Object.entries(
        abcResults,
      )) {
        const role = roles[strToInt(roleKey)];
        expect(contributions.whereRole(role).first().amount.value).toBeCloseTo(
          expectedContribution,
        );
      }
    },
  );
});
