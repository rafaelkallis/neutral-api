import td from 'testdouble';
import { User } from 'user/domain/User';
import { InternalProject } from 'project/domain/project/Project';
import { SkipManagerReview } from 'project/domain/project/value-objects/SkipManagerReview';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { ModelFaker } from 'test/ModelFaker';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { DomainException } from 'shared/domain/exceptions/DomainException';
import { ValueObjectFaker } from 'test/ValueObjectFaker';
import { UserCollection } from 'user/domain/UserCollection';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { Role } from 'project/domain/role/Role';
import { PeerReviewFlag } from 'project/domain/peer-review/value-objects/PeerReviewFlag';
import { PeerReviewMilestoneState } from 'project/domain/milestone/value-objects/states/PeerReviewMilestoneState';
import { ActiveProjectState } from 'project/domain/project/value-objects/states/ActiveProjectState';
import { ReadonlyMilestone } from '../../Milestone';
import { FinishedMilestoneState } from './FinishedMilestoneState';
import { ManagerReviewMilestoneState } from './ManagerReviewMilestoneState';
import { PeerReviewsSubmittedEvent } from '../../events/PeerReviewsSubmittedEvent';
import { FinalPeerReviewSubmittedEvent } from '../../events/FinalPeerReviewSubmittedEvent';
import {
  ProjectAnalysisResult,
  ProjectAnalyzer,
} from 'project/domain/ProjectAnalyzer';

describe('' + PeerReviewMilestoneState.name, () => {
  let valueObjectFaker: ValueObjectFaker;
  let modelFaker: ModelFaker;

  let creator: User;
  let project: InternalProject;
  let milestone: ReadonlyMilestone;
  let projectAnalysisResult: ProjectAnalysisResult;
  let projectAnalyzer: ProjectAnalyzer;

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
    project.finishFormation();

    if (!project.state.equals(ActiveProjectState.INSTANCE)) {
      throw new Error('precondition failed: project is not in active state');
    }

    milestone = project.addMilestone(
      valueObjectFaker.milestone.title(),
      valueObjectFaker.milestone.description(),
    );

    projectAnalysisResult = td.object();
    td.when(projectAnalysisResult.applyTo(project));
    projectAnalyzer = td.object();
    td.when(projectAnalyzer.analyze(project.latestMilestone)).thenResolve(
      projectAnalysisResult,
    );

    if (!milestone.state.equals(PeerReviewMilestoneState.INSTANCE)) {
      throw new Error(
        'precondition failed: milestone is not in peer-review state',
      );
    }
  });

  describe('submit peer review', () => {
    let submittedPeerReviews: PeerReviewCollection;

    beforeEach(() => {
      const sender = project.roles.first();
      const reviewTopic = project.reviewTopics.first();
      submittedPeerReviews = PeerReviewCollection.empty();
      for (const receiver of project.roles.whereNot(sender)) {
        submittedPeerReviews.add(
          PeerReview.create(
            sender.id,
            receiver.id,
            reviewTopic.id,
            milestone.id,
            PeerReviewScore.of(1),
            PeerReviewFlag.NONE,
            project,
          ),
        );
      }
    });

    test('should fail if a peer review is for non-existing peer', async () => {
      const roles = project.roles.toArray();
      const reviewTopic = project.reviewTopics.first();
      submittedPeerReviews = PeerReviewCollection.of([
        PeerReview.create(
          roles[0].id,
          RoleId.create(),
          reviewTopic.id,
          milestone.id,
          PeerReviewScore.of(1),
          PeerReviewFlag.NONE,
          project,
        ),
        PeerReview.create(
          roles[0].id,
          roles[2].id,
          reviewTopic.id,
          milestone.id,
          PeerReviewScore.of(1),
          PeerReviewFlag.NONE,
          project,
        ),
        PeerReview.create(
          roles[0].id,
          roles[3].id,
          reviewTopic.id,
          milestone.id,
          PeerReviewScore.of(1),
          PeerReviewFlag.NONE,
          project,
        ),
      ]);
      await expect(
        project.submitPeerReviews(submittedPeerReviews, projectAnalyzer),
      ).rejects.toThrow(expect.any(DomainException));
    });

    test('should not compute contributions and consensuality', async () => {
      await project.submitPeerReviews(submittedPeerReviews, projectAnalyzer);
      expect(
        milestone.state.equals(PeerReviewMilestoneState.INSTANCE),
      ).toBeTruthy();
      expect(project.contributions.isEmpty()).toBeTruthy();
    });

    describe('final peer review', () => {
      beforeEach(async () => {
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
            const submittedPeerReviews = PeerReviewCollection.empty();
            for (const receiver of project.roles.whereNot(sender)) {
              submittedPeerReviews.add(
                PeerReview.create(
                  sender.id,
                  receiver.id,
                  reviewTopic.id,
                  milestone.id,
                  PeerReviewScore.of(1),
                  PeerReviewFlag.NONE,
                  project,
                ),
              );
            }
            await project.submitPeerReviews(
              submittedPeerReviews,
              projectAnalyzer,
            );
          }
        }
      });

      test('should advance state and compute contributions and compute consensuality', async () => {
        jest.spyOn(project.contributions, 'addAll');
        await project.submitPeerReviews(submittedPeerReviews, projectAnalyzer);
        expect(project.domainEvents).toContainEqual(
          expect.any(PeerReviewsSubmittedEvent),
        );
        expect(project.domainEvents).toContainEqual(
          expect.any(FinalPeerReviewSubmittedEvent),
        );
        expect(
          milestone.state.equals(PeerReviewMilestoneState.INSTANCE),
        ).toBeFalsy();
        td.verify(projectAnalysisResult.applyTo(project));
      });

      test('should skip manager review if "skipManagerReview" is "yes"', async () => {
        project.skipManagerReview = SkipManagerReview.YES;
        await project.submitPeerReviews(submittedPeerReviews, projectAnalyzer);
        expect(milestone.state).toBe(FinishedMilestoneState.INSTANCE);
      });

      test('should skip manager review if "skipManagerReview" is "if-consensual" and reviews are consensual', async () => {
        project.skipManagerReview = SkipManagerReview.IF_CONSENSUAL;
        jest.spyOn(project, 'isConsensual').mockReturnValue(true);
        await project.submitPeerReviews(submittedPeerReviews, projectAnalyzer);
        expect(
          milestone.state.equals(FinishedMilestoneState.INSTANCE),
        ).toBeTruthy();
      });

      test('should not skip manager review if "skipManagerReview" is "if-consensual" and reviews are not consensual', async () => {
        project.skipManagerReview = SkipManagerReview.IF_CONSENSUAL;
        jest.spyOn(project, 'isConsensual').mockReturnValue(false);
        await project.submitPeerReviews(submittedPeerReviews, projectAnalyzer);
        expect(milestone.state).toBe(ManagerReviewMilestoneState.INSTANCE);
      });

      test('should not skip manager review if "skipManagerReview" is "no"', async () => {
        project.skipManagerReview = SkipManagerReview.NO;
        await project.submitPeerReviews(submittedPeerReviews, projectAnalyzer);
        expect(
          milestone.state.equals(ManagerReviewMilestoneState.INSTANCE),
        ).toBeTruthy();
      });
    });
  });

  describe('complete', () => {
    beforeEach(async () => {
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
          const submittedPeerReviews = PeerReviewCollection.empty();
          for (const receiver of project.roles.whereNot(sender)) {
            submittedPeerReviews.add(
              PeerReview.create(
                sender.id,
                receiver.id,
                reviewTopic.id,
                milestone.id,
                PeerReviewScore.of(Math.random() * 100),
                PeerReviewFlag.NONE,
                project,
              ),
            );
          }
          await project.submitPeerReviews(
            submittedPeerReviews,
            projectAnalyzer,
          );
        }
      }
    });

    test('should complete missing peer reviews', async () => {
      await project.completePeerReviews(projectAnalyzer);
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
        const meanScore = PeerReviewScore.of(
          project.peerReviews.whereReviewTopic(rt).meanScore(),
        );
        for (const peerReview of project.peerReviews
          .whereReviewTopic(rt)
          .whereSenderRole(ro)) {
          expect(peerReview.score.value).toBeCloseTo(meanScore.value);
          expect(peerReview.flag).toBe(PeerReviewFlag.ASBENT);
        }
      }
    });

    test('should advance state', async () => {
      await project.completePeerReviews(projectAnalyzer);
      expect(
        milestone.state.equals(PeerReviewMilestoneState.INSTANCE),
      ).toBeFalsy();
    });
  });
});
