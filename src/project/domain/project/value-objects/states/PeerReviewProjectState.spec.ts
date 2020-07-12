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
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import {
  ConsensualityComputer,
  ConsensualityComputationResult,
} from 'project/domain/ConsensualityComputer';
import { DomainException } from 'shared/domain/exceptions/DomainException';
import { ValueObjectFaker } from 'test/ValueObjectFaker';
import { UserCollection } from 'user/domain/UserCollection';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { Role } from 'project/domain/role/Role';
import { ContributionCollection } from 'project/domain/contribution/ContributionCollection';

describe(PeerReviewProjectState.name, () => {
  let valueObjectFaker: ValueObjectFaker;
  let modelFaker: ModelFaker;

  let creator: User;
  let project: InternalProject;
  let computedContributions: ContributionCollection;
  let consensualityComputationResult: ConsensualityComputationResult;
  let contributionsComputer: ContributionsComputer;
  let consensualityComputer: ConsensualityComputer;

  beforeEach(() => {
    valueObjectFaker = new ValueObjectFaker();
    modelFaker = new ModelFaker();

    creator = modelFaker.user();
    project = modelFaker.project(creator.id);
    project.addRole(
      valueObjectFaker.role.title(),
      valueObjectFaker.role.description(),
    );
    project.addRole(
      valueObjectFaker.role.title(),
      valueObjectFaker.role.description(),
    );
    project.addRole(
      valueObjectFaker.role.title(),
      valueObjectFaker.role.description(),
    );
    project.addRole(
      valueObjectFaker.role.title(),
      valueObjectFaker.role.description(),
    );

    project.addReviewTopic(
      valueObjectFaker.reviewTopic.title(),
      valueObjectFaker.reviewTopic.description(),
      valueObjectFaker.reviewTopic.input(),
    );
    project.addReviewTopic(
      valueObjectFaker.reviewTopic.title(),
      valueObjectFaker.reviewTopic.description(),
      valueObjectFaker.reviewTopic.input(),
    );

    const assignees = new UserCollection([]);
    for (const role of project.roles) {
      const assignee = modelFaker.user();
      assignees.add(assignee);
      project.assignUserToRole(assignee, role.id);
    }
    project.finishFormation(assignees);

    contributionsComputer = td.object();
    computedContributions = new ContributionCollection([]);
    td.when(contributionsComputer.compute(project)).thenReturn(
      computedContributions,
    );
    consensualityComputer = td.object();
    consensualityComputationResult = td.object();
    td.when(consensualityComputer.compute(project)).thenReturn(
      consensualityComputationResult,
    );

    if (!project.state.equals(PeerReviewProjectState.INSTANCE)) {
      throw new Error(
        'precondition failed: project is not in peer-review state',
      );
    }
  });

  describe('submit peer review', () => {
    let submittedPeerReviews: PeerReviewCollection;

    beforeEach(() => {
      const sender = project.roles.first();
      const reviewTopic = project.reviewTopics.first();
      submittedPeerReviews = new PeerReviewCollection([]);
      for (const receiver of project.roles.whereNot(sender)) {
        submittedPeerReviews.add(
          PeerReview.from(
            sender.id,
            receiver.id,
            reviewTopic.id,
            PeerReviewScore.equalSplit(project.roles.count()),
          ),
        );
      }
    });

    test('should fail if a peer review is for non-existing peer', () => {
      const roles = project.roles.toArray();
      const reviewTopic = project.reviewTopics.first();
      submittedPeerReviews = new PeerReviewCollection([
        PeerReview.from(
          roles[0].id,
          RoleId.create(),
          reviewTopic.id,
          PeerReviewScore.equalSplit(project.roles.count()),
        ),
        PeerReview.from(
          roles[0].id,
          roles[2].id,
          reviewTopic.id,
          PeerReviewScore.equalSplit(project.roles.count()),
        ),
        PeerReview.from(
          roles[0].id,
          roles[3].id,
          reviewTopic.id,
          PeerReviewScore.equalSplit(project.roles.count()),
        ),
      ]);
      expect(() =>
        project.submitPeerReviews(
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        ),
      ).toThrow(expect.any(DomainException));
    });

    test('should not compute contributions and consensuality', () => {
      project.submitPeerReviews(
        submittedPeerReviews,
        contributionsComputer,
        consensualityComputer,
      );
      expect(
        project.state.equals(PeerReviewProjectState.INSTANCE),
      ).toBeTruthy();
      expect(project.contributions.isEmpty()).toBeTruthy();
    });

    describe('final peer review', () => {
      beforeEach(() => {
        // submit all peer reviews except for one
        for (const reviewTopic of project.reviewTopics) {
          for (const sender of project.roles) {
            if (
              reviewTopic.equals(project.reviewTopics.first()) &&
              sender.equals(project.roles.first())
            ) {
              // skip peer review of first role for first review topic
              continue;
            }
            const submittedPeerReviews = new PeerReviewCollection([]);
            for (const receiver of project.roles.whereNot(sender)) {
              submittedPeerReviews.add(
                PeerReview.from(
                  sender.id,
                  receiver.id,
                  reviewTopic.id,
                  PeerReviewScore.equalSplit(project.roles.count()),
                ),
              );
            }
            project.submitPeerReviews(
              submittedPeerReviews,
              contributionsComputer,
              consensualityComputer,
            );
          }
        }
      });

      test('should advance state and compute contributions and compute consensuality', () => {
        jest.spyOn(project.contributions, 'addAll');
        project.submitPeerReviews(
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
          project.state.equals(PeerReviewProjectState.INSTANCE),
        ).toBeFalsy();
        expect(project.contributions.addAll).toHaveBeenCalledWith(
          computedContributions,
        );
        td.verify(consensualityComputationResult.applyTo(project));
      });

      test('should skip manager review if "skipManagerReview" is "yes"', () => {
        project.skipManagerReview = SkipManagerReview.YES;
        project.submitPeerReviews(
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(project.state).toBe(FinishedProjectState.INSTANCE);
      });

      test('should skip manager review if "skipManagerReview" is "if-consensual" and reviews are consensual', () => {
        project.skipManagerReview = SkipManagerReview.IF_CONSENSUAL;
        jest.spyOn(project, 'isConsensual').mockReturnValue(true);
        project.submitPeerReviews(
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
        project.submitPeerReviews(
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(project.state).toBe(ManagerReviewProjectState.INSTANCE);
      });

      test('should not skip manager review if "skipManagerReview" is "no"', () => {
        project.skipManagerReview = SkipManagerReview.NO;
        project.submitPeerReviews(
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(
          project.state.equals(ManagerReviewProjectState.INSTANCE),
        ).toBeTruthy();
      });
    });
  });

  describe('complete', () => {
    beforeEach(() => {
      // review topic (rt)
      // role (ro)
      // submit all peer reviews except for (rt1, ro3), (rt2, ro2), (rt2, ro4)
      const [, ro2, ro3, ro4] = project.roles;
      const [rt1, rt2] = project.reviewTopics;
      for (const reviewTopic of project.reviewTopics) {
        for (const sender of project.roles) {
          if (reviewTopic.equals(rt1) && sender.equals(ro3)) {
            continue;
          }
          if (reviewTopic.equals(rt2) && sender.equals(ro2)) {
            continue;
          }
          if (reviewTopic.equals(rt2) && sender.equals(ro4)) {
            continue;
          }
          const submittedPeerReviews = new PeerReviewCollection([]);
          for (const receiver of project.roles.whereNot(sender)) {
            submittedPeerReviews.add(
              PeerReview.from(
                sender.id,
                receiver.id,
                reviewTopic.id,
                PeerReviewScore.equalSplit(project.roles.count()),
              ),
            );
          }
          project.submitPeerReviews(
            submittedPeerReviews,
            contributionsComputer,
            consensualityComputer,
          );
        }
      }
    });

    test('should complete missing peer reviews', () => {
      project.completePeerReviews(contributionsComputer, consensualityComputer);
      expect(project.peerReviews.count()).toBe(
        project.reviewTopics.count() *
          project.roles.count() *
          (project.roles.count() - 1),
      );
      const [, ro2, ro3, ro4] = project.roles;
      const [rt1, rt2] = project.reviewTopics;
      for (const [rt, ro] of [
        [rt1, ro3],
        [rt2, ro2],
        [rt2, ro4],
      ] as [ReviewTopic, Role][]) {
        for (const peerReview of project.peerReviews
          .whereReviewTopic(rt)
          .whereSenderRole(ro)) {
          expect(
            peerReview.score.equals(
              PeerReviewScore.equalSplit(project.roles.count()),
            ),
          ).toBeTruthy();
        }
      }
    });

    test('should advance state', () => {
      project.completePeerReviews(contributionsComputer, consensualityComputer);
      expect(project.state.equals(PeerReviewProjectState.INSTANCE)).toBeFalsy();
    });
  });
});
