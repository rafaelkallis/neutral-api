import td from 'testdouble';
import { User } from 'user/domain/User';
import { InternalProject } from 'project/domain/project/Project';
import { SkipManagerReview } from 'project/domain/project/value-objects/SkipManagerReview';
import { PeerReviewsSubmittedEvent } from 'project/domain/events/PeerReviewsSubmittedEvent';
import { FinalPeerReviewSubmittedEvent } from 'project/domain/events/FinalPeerReviewSubmittedEvent';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { ModelFaker } from 'test/ModelFaker';
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
import { DomainException } from 'shared/domain/exceptions/DomainException';

describe(PeerReviewProjectState.name, () => {
  let modelFaker: ModelFaker;

  let state: ProjectState;
  let creator: User;
  let project: InternalProject;

  beforeEach(() => {
    modelFaker = new ModelFaker();

    state = PeerReviewProjectState.INSTANCE;

    creator = modelFaker.user();
    project = modelFaker.project(creator.id);
  });

  describe('submit peer review', () => {
    let roles: Role[];
    let reviewTopic: ReviewTopic;
    let submittedPeerReviews: PeerReviewCollection;
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
        'assertNotCompleteForSenderRoleAndReviewTopic',
      );

      submittedPeerReviews = new PeerReviewCollection([
        PeerReview.from(
          roles[0].id,
          roles[1].id,
          reviewTopic.id,
          PeerReviewScore.from(1 / 3),
        ),
        PeerReview.from(
          roles[0].id,
          roles[2].id,
          reviewTopic.id,
          PeerReviewScore.from(1 / 3),
        ),
        PeerReview.from(
          roles[0].id,
          roles[3].id,
          reviewTopic.id,
          PeerReviewScore.from(1 / 3),
        ),
      ]);

      consensualityComputationResult = td.object();
      td.when(consensualityComputer.compute(project)).thenReturn(
        consensualityComputationResult,
      );

      contributionsComputationResult = td.object();
      td.when(contributionsComputer.compute(project)).thenReturn(
        contributionsComputationResult,
      );
    });

    test('should fail if a peer review is for non-existing peer', () => {
      submittedPeerReviews = new PeerReviewCollection([
        PeerReview.from(
          roles[0].id,
          RoleId.create(),
          reviewTopic.id,
          PeerReviewScore.from(1 / 3),
        ),
        PeerReview.from(
          roles[0].id,
          roles[2].id,
          reviewTopic.id,
          PeerReviewScore.from(1 / 3),
        ),
        PeerReview.from(
          roles[0].id,
          roles[3].id,
          reviewTopic.id,
          PeerReviewScore.from(1 / 3),
        ),
      ]);
      expect(() =>
        state.submitPeerReviews(
          project,
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        ),
      ).toThrow(expect.any(DomainException));
    });

    describe('final peer review', () => {
      beforeEach(() => {
        jest.spyOn(project.peerReviews, 'areComplete').mockReturnValue(true);
      });

      test('should advance state and compute contributions and compute consensuality', () => {
        state.submitPeerReviews(
          project,
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
        jest.spyOn(project.peerReviews, 'areComplete').mockReturnValue(false);
      });

      test('should not compute contributions and consensuality', () => {
        state.submitPeerReviews(
          project,
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(
          project.state.equals(PeerReviewProjectState.INSTANCE),
        ).toBeTruthy();
        expect(project.contributions.isEmpty()).toBeTruthy();
      });
    });
  });
});
