import td from 'testdouble';
import { User } from 'user/domain/User';
import { Project } from 'project/domain/project/Project';
import { SkipManagerReview } from 'project/domain/project/value-objects/SkipManagerReview';
import { PeerReviewsSubmittedEvent } from 'project/domain/events/PeerReviewsSubmittedEvent';
import { FinalPeerReviewSubmittedEvent } from 'project/domain/events/FinalPeerReviewSubmittedEvent';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { HasSubmittedPeerReviews } from 'project/domain/role/value-objects/HasSubmittedPeerReviews';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { ModelFaker } from 'test/ModelFaker';
import { PeerReviewRoleMismatchException } from 'project/domain/exceptions/PeerReviewRoleMismatchException';
import { PeerReviewsAlreadySubmittedException } from 'project/domain/exceptions/PeerReviewsAlreadySubmittedException';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { ProjectPeerReview } from 'project/domain/project/value-objects/states/ProjectPeerReview';
import { ManagerReviewProjectState } from 'project/domain/project/value-objects/states/ManagerReviewProjectState';
import { FinishedProjectState } from 'project/domain/project/value-objects/states/FinishedProjectState';
import { ProjectState } from 'project/domain/project/value-objects/states/ProjectState';
import { Role } from 'project/domain/role/Role';
import {
  ContributionsComputer,
  ContributionsComputationResult,
} from 'project/domain/ContributionsComputer';
import {
  ConsensualityComputer,
  ConsensualityComputationResult,
} from 'project/domain/ConsensualityComputer';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';

describe(ProjectPeerReview.name, () => {
  let modelFaker: ModelFaker;

  let state: ProjectState;
  let creator: User;
  let project: Project;

  beforeEach(() => {
    modelFaker = new ModelFaker();

    state = ProjectPeerReview.INSTANCE;

    creator = modelFaker.user();
    project = modelFaker.project(creator.id);
  });

  describe('submit peer review', () => {
    let roles: Role[];
    let reviewTopic: ReviewTopic;
    let submittedPeerReviews: [RoleId, PeerReviewScore][];
    let contributionsComputationResult: ContributionsComputationResult;
    let consensualityComputationResult: ConsensualityComputationResult;
    let contributionsComputer: ContributionsComputer;
    let consensualityComputer: ConsensualityComputer;

    beforeEach(() => {
      contributionsComputer = td.object();
      consensualityComputer = td.object();
      project.state = ProjectPeerReview.INSTANCE;
      roles = [
        modelFaker.role(creator.id),
        modelFaker.role(),
        modelFaker.role(),
        modelFaker.role(),
      ];
      project.roles.addAll(roles);

      reviewTopic = modelFaker.reviewTopic();
      project.reviewTopics.add(reviewTopic);

      project.skipManagerReview = SkipManagerReview.NO;
      roles[0].hasSubmittedPeerReviews = HasSubmittedPeerReviews.FALSE;
      roles[1].hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
      roles[2].hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
      roles[3].hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;

      const peerReviews: PeerReview[] = [];
      for (const senderRole of project.roles.toArray()) {
        for (const receiverRole of project.roles.toArray()) {
          if (senderRole.equals(receiverRole)) {
            // no self review
            continue;
          }
          if (senderRole.equals(roles[0])) {
            continue;
          }
          const peerReview = modelFaker.peerReview(
            senderRole.id,
            receiverRole.id,
            reviewTopic.id,
          );
          peerReviews.push(peerReview);
        }
      }
      project.peerReviews = new PeerReviewCollection(peerReviews);

      submittedPeerReviews = [
        [roles[1].id, PeerReviewScore.from(1 / 3)],
        [roles[2].id, PeerReviewScore.from(1 / 3)],
        [roles[3].id, PeerReviewScore.from(1 / 3)],
      ];

      consensualityComputationResult = td.object();
      td.when(consensualityComputer.compute(project.peerReviews)).thenReturn(
        consensualityComputationResult,
      );

      contributionsComputationResult = td.object();
      td.when(contributionsComputer.compute(project.peerReviews)).thenReturn(
        contributionsComputationResult,
      );
    });

    describe('happy path', () => {
      test('final peer review', () => {
        state.submitPeerReviews(
          project,
          roles[0].id,
          reviewTopic.id,
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(project.domainEvents).toContainEqual(
          expect.any(PeerReviewsSubmittedEvent),
        );
        expect(project.domainEvents).toContainEqual(
          expect.any(FinalPeerReviewSubmittedEvent),
        );
        expect(
          project.state.equals(ManagerReviewProjectState.INSTANCE),
        ).toBeTruthy();
        td.verify(contributionsComputationResult.applyTo(project));
        td.verify(consensualityComputationResult.applyTo(project));
      });

      test('final peer review, should skip manager review if "skipManagerReview" is "yes"', () => {
        project.skipManagerReview = SkipManagerReview.YES;
        state.submitPeerReviews(
          project,
          roles[0].id,
          reviewTopic.id,
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(project.state).toBe(FinishedProjectState.INSTANCE);
      });

      test('final peer review, should skip manager review if "skipManagerReview" is "if-consensual" and reviews are consensual', () => {
        project.skipManagerReview = SkipManagerReview.IF_CONSENSUAL;
        jest.spyOn(project, 'isConsensual').mockReturnValue(true);
        state.submitPeerReviews(
          project,
          roles[0].id,
          reviewTopic.id,
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(
          project.state.equals(FinishedProjectState.INSTANCE),
        ).toBeTruthy();
      });

      test('final peer review, should not skip manager review if "skipManagerReview" is "if-consensual" and reviews are not consensual', () => {
        project.skipManagerReview = SkipManagerReview.IF_CONSENSUAL;
        jest.spyOn(project, 'isConsensual').mockReturnValue(false);
        state.submitPeerReviews(
          project,
          roles[0].id,
          reviewTopic.id,
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(project.state).toBe(ManagerReviewProjectState.INSTANCE);
      });

      test('final peer review, should not skip manager review if "skipManagerReview" is "no"', () => {
        project.skipManagerReview = SkipManagerReview.NO;
        state.submitPeerReviews(
          project,
          roles[0].id,
          reviewTopic.id,
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(
          project.state.equals(ManagerReviewProjectState.INSTANCE),
        ).toBeTruthy();
      });

      test('not final peer review, should not compute contributions and consensuality', () => {
        roles[1].hasSubmittedPeerReviews = HasSubmittedPeerReviews.FALSE;
        state.submitPeerReviews(
          project,
          roles[0].id,
          reviewTopic.id,
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(project.state.equals(ProjectPeerReview.INSTANCE)).toBeTruthy();
        expect(project.contributions.toArray()).toHaveLength(0);
      });
    });

    test('should fail if peer reviews have been previously submitted', () => {
      roles[0].hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
      expect(() =>
        state.submitPeerReviews(
          project,
          roles[0].id,
          reviewTopic.id,
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        ),
      ).toThrow(expect.any(PeerReviewsAlreadySubmittedException));
    });

    test('should fail if a peer review miss a peer', () => {
      submittedPeerReviews = [
        [roles[1].id, PeerReviewScore.from(1 / 2)],
        [roles[3].id, PeerReviewScore.from(1 / 2)],
      ];
      expect(() =>
        state.submitPeerReviews(
          project,
          roles[0].id,
          reviewTopic.id,
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        ),
      ).toThrow(expect.any(PeerReviewRoleMismatchException));
    });

    test('should fail if a peer review is for non-existing peer', () => {
      submittedPeerReviews = [
        [RoleId.create(), PeerReviewScore.from(1 / 3)],
        [roles[2].id, PeerReviewScore.from(1 / 3)],
        [roles[3].id, PeerReviewScore.from(1 / 3)],
      ];
      expect(() =>
        state.submitPeerReviews(
          project,
          roles[0].id,
          reviewTopic.id,
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        ),
      ).toThrow(expect.any(PeerReviewRoleMismatchException));
    });
  });
});
