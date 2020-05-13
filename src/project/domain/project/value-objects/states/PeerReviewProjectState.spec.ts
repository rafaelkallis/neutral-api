import td from 'testdouble';
import { User } from 'user/domain/User';
import { Project } from 'project/domain/project/Project';
import { SkipManagerReview } from 'project/domain/project/value-objects/SkipManagerReview';
import { PeerReviewsSubmittedEvent } from 'project/domain/events/PeerReviewsSubmittedEvent';
import { FinalPeerReviewSubmittedEvent } from 'project/domain/events/FinalPeerReviewSubmittedEvent';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { ModelFaker } from 'test/ModelFaker';
import { PeerReviewRoleMismatchException } from 'project/domain/exceptions/PeerReviewRoleMismatchException';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { PeerReviewProjectState } from 'project/domain/project/value-objects/states/PeerReviewProjectState';
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

describe(PeerReviewProjectState.name, () => {
  let modelFaker: ModelFaker;

  let state: ProjectState;
  let creator: User;
  let project: Project;

  beforeEach(() => {
    modelFaker = new ModelFaker();

    state = PeerReviewProjectState.INSTANCE;

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
      project.state = PeerReviewProjectState.INSTANCE;
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
      jest.spyOn(
        project.peerReviews,
        'assertNotSubmittedForSenderRoleAndReviewTopic',
      );

      submittedPeerReviews = [
        [roles[1].id, PeerReviewScore.from(1 / 3)],
        [roles[2].id, PeerReviewScore.from(1 / 3)],
        [roles[3].id, PeerReviewScore.from(1 / 3)],
      ];

      consensualityComputationResult = td.object();
      td.when(consensualityComputer.compute(project)).thenReturn(
        consensualityComputationResult,
      );

      contributionsComputationResult = td.object();
      td.when(contributionsComputer.compute(project)).thenReturn(
        contributionsComputationResult,
      );
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

    describe('final peer review', () => {
      beforeEach(() => {
        jest.spyOn(project.peerReviews, 'areSubmitted').mockReturnValue(true);
      });

      test('should advance state and compute contributions and compute consensuality', () => {
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

      test('should skip manager review if "skipManagerReview" is "yes"', () => {
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

      test('should skip manager review if "skipManagerReview" is "if-consensual" and reviews are consensual', () => {
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

      test('should not skip manager review if "skipManagerReview" is "if-consensual" and reviews are not consensual', () => {
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

      test('should not skip manager review if "skipManagerReview" is "no"', () => {
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
    });

    describe('not final peer review', () => {
      beforeEach(() => {
        jest.spyOn(project.peerReviews, 'areSubmitted').mockReturnValue(false);
      });

      test('should not compute contributions and consensuality', () => {
        state.submitPeerReviews(
          project,
          roles[0].id,
          reviewTopic.id,
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(
          project.state.equals(PeerReviewProjectState.INSTANCE),
        ).toBeTruthy();
        expect(project.contributions.isEmpty()).toBeTruthy();
        expect(
          project.peerReviews.assertNotSubmittedForSenderRoleAndReviewTopic,
        ).toHaveBeenCalledWith(project, roles[0].id, reviewTopic.id);
      });
    });
  });
});
