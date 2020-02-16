import { ConsensualityModelService } from 'project/domain/ConsensualityModelService';
import { UserModel } from 'user';
import {
  ProjectModel,
  CreateProjectOptions,
} from 'project/domain/ProjectModel';
import { RoleModel, PeerReviewModel } from 'role';
import { ModelFaker, PrimitiveFaker } from 'test';
import { MockEventPublisherService } from 'event';
import { SkipManagerReview } from 'project/domain/value-objects/SkipManagerReview';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/value-objects/ProjectDescription';
import { ProjectCreatedEvent } from 'project/domain/events/ProjectCreatedEvent';
import { ProjectFormationStartedEvent } from 'project/domain/events/ProjectFormationStartedEvent';
import { ProjectUpdatedEvent } from 'project/domain/events/ProjectUpdatedEvent';
import { ProjectFormationFinishedEvent } from 'project/domain/events/ProjectFormationFinishedEvent';
import { ProjectPeerReviewStartedEvent } from 'project/domain/events/ProjectPeerReviewStartedEvent';
import { ProjectDeletedEvent } from 'project/domain/events/ProjectDeletedEvent';
import { Id } from 'common/domain/value-objects/Id';
import { PeerReviewsSubmittedEvent } from 'project/domain/events/PeerReviewsSubmittedEvent';
import { FinalPeerReviewSubmittedEvent } from 'project/domain/events/FinalPeerReviewSubmittedEvent';

describe('project domain service', () => {
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;

  let eventPublisher: MockEventPublisherService;
  let consensualityModelService: ConsensualityModelService;
  let creator: UserModel;
  let project: ProjectModel;
  let roles: RoleModel[];

  beforeEach(() => {
    primitiveFaker = new PrimitiveFaker();
    modelFaker = new ModelFaker();

    eventPublisher = new MockEventPublisherService();
    consensualityModelService = new ConsensualityModelService();

    creator = modelFaker.user();
    project = modelFaker.project(creator.id);
    roles = [
      modelFaker.role(project.id, creator.id),
      modelFaker.role(project.id),
      modelFaker.role(project.id),
      modelFaker.role(project.id),
    ];
  });

  describe('create project', () => {
    let title: ProjectTitle;
    let description: ProjectDescription;
    let createProjectOptions: CreateProjectOptions;

    beforeEach(() => {
      title = ProjectTitle.from(primitiveFaker.words());
      description = ProjectDescription.from(primitiveFaker.paragraph());
      createProjectOptions = { title, description, creator };
    });

    test('happy path', () => {
      project = ProjectModel.create(createProjectOptions);
      expect(eventPublisher.getPublishedEvents()).toEqual([
        expect.any(ProjectCreatedEvent),
        expect.any(ProjectFormationStartedEvent),
      ]);
    });
  });

  describe('update project', () => {
    let title: ProjectTitle;

    beforeEach(() => {
      project.state = ProjectState.FORMATION;
      title = ProjectTitle.from(primitiveFaker.words());
    });

    test('happy path', () => {
      project.update(title);
      expect(eventPublisher.getPublishedEvents()).toEqual([
        expect.any(ProjectUpdatedEvent),
      ]);
    });

    test('should fail if project is not in formation state', () => {
      project.state = ProjectState.PEER_REVIEW;
      expect(() => project.update(title)).toThrow();
    });
  });

  describe('finish formation', () => {
    beforeEach(() => {
      project.state = ProjectState.FORMATION;
    });

    test('happy path', () => {
      project.finishFormation(roles);
      expect(eventPublisher.getPublishedEvents()).toEqual([
        expect.any(ProjectFormationFinishedEvent),
        expect.any(ProjectPeerReviewStartedEvent),
      ]);
    });

    test('should fail if project is not in formation state', () => {
      project.state = ProjectState.PEER_REVIEW;
      expect(() => project.finishFormation(roles)).toThrow();
    });

    test('should fail if a role has no user assigned', () => {
      roles[0].assigneeId = null;
      expect(() => project.finishFormation(roles)).toThrow();
    });
  });

  describe('delete project', () => {
    test('happy path', () => {
      project.delete();
      expect(eventPublisher.getPublishedEvents()).toEqual([
        expect.any(ProjectDeletedEvent),
      ]);
    });

    test('should fail if project is not in formation state', () => {
      project.state = ProjectState.PEER_REVIEW;
      expect(() => project.delete()).toThrow();
    });
  });

  describe('submit peer reviews', () => {
    let peerReviewMap: Map<Id, number>;

    beforeEach(() => {
      project.state = ProjectState.PEER_REVIEW;
      roles[0].hasSubmittedPeerReviews = false;
      roles[1].hasSubmittedPeerReviews = true;
      roles[2].hasSubmittedPeerReviews = true;
      roles[3].hasSubmittedPeerReviews = true;

      const peerReviews: PeerReviewModel[] = [];
      for (const senderRole of roles) {
        for (const receiverRole of roles) {
          if (senderRole === receiverRole) {
            // no self review
            continue;
          }
          if (senderRole === roles[0]) {
            continue;
          }
          const peerReview = modelFaker.peerReview(
            senderRole.id,
            receiverRole.id,
          );
          peerReviews.push(peerReview);
        }
      }

      peerReviewMap = new Map();
      peerReviewMap.set(roles[1].id, 1 / 3);
      peerReviewMap.set(roles[2].id, 1 / 3);
      peerReviewMap.set(roles[3].id, 1 / 3);
    });

    describe('happy path', () => {
      test('final peer review', () => {
        project.submitPeerReviews(roles[0], peerReviewMap, roles);
        expect(eventPublisher.getPublishedEvents()).toEqual([
          expect.any(PeerReviewsSubmittedEvent),
          expect.any(FinalPeerReviewSubmittedEvent),
        ]);
        expect(project.state).toBe(ProjectState.MANAGER_REVIEW);
        for (const role of roles) {
          expect(role.contribution).toEqual(expect.any(Number));
        }
        expect(project.consensuality).toEqual(expect.any(Number));
      });

      test('final peer review, should skip manager review if "skipManagerReview" is "yes"', () => {
        project.skipManagerReview = SkipManagerReview.YES;
        project.submitPeerReviews(roles[0], peerReviewMap, roles);
        expect(project.state).toBe(ProjectState.FINISHED);
      });

      test('final peer review, should skip manager review if "skipManagerReview" is "if-consensual" and reviews are consensual', () => {
        project.skipManagerReview = SkipManagerReview.IF_CONSENSUAL;
        jest
          .spyOn(consensualityModelService, 'isConsensual')
          .mockReturnValue(true);
        project.submitPeerReviews(roles[0], peerReviewMap, roles);
        expect(project.state).toBe(ProjectState.FINISHED);
      });

      test('final peer review, should not skip manager review if "skipManagerReview" is "if-consensual" and reviews are not consensual', () => {
        project.skipManagerReview = SkipManagerReview.IF_CONSENSUAL;
        jest
          .spyOn(consensualityModelService, 'isConsensual')
          .mockReturnValue(false);
        project.submitPeerReviews(roles[0], peerReviewMap, roles);
        expect(project.state).toBe(ProjectState.MANAGER_REVIEW);
      });

      test('final peer review, should not skip manager review if "skipManagerReview" is "no"', () => {
        project.skipManagerReview = SkipManagerReview.NO;
        project.submitPeerReviews(roles[0], peerReviewMap, roles);
        expect(project.state).toBe(ProjectState.MANAGER_REVIEW);
      });

      test('not final peer review, should not compute contributions and consensuality', () => {
        roles[1].hasSubmittedPeerReviews = false;
        project.submitPeerReviews(roles[0], peerReviewMap, roles);
        for (const role of roles) {
          expect(role.contribution).toBeNull();
        }
        expect(project.state).toBe(ProjectState.PEER_REVIEW);
      });
    });

    test('should fail if project is not in peer-review state', () => {
      project.state = ProjectState.FORMATION;
      expect(() =>
        project.submitPeerReviews(roles[0], peerReviewMap, roles),
      ).toThrow();
    });

    test('should fail if peer reviews have been previously submitted', () => {
      roles[0].hasSubmittedPeerReviews = true;
      expect(() =>
        project.submitPeerReviews(roles[0], peerReviewMap, roles),
      ).toThrow();
    });

    test('should fail if a peer review is for non-existing peer', () => {
      peerReviewMap.delete(roles[1].id);
      peerReviewMap.set(Id.from(primitiveFaker.id()), 1 / 3);
      expect(() =>
        project.submitPeerReviews(roles[0], peerReviewMap, roles),
      ).toThrow();
    });
  });

  describe('submit manager review', () => {
    beforeEach(() => {
      project.state = ProjectState.MANAGER_REVIEW;
    });

    test('happy path', () => {
      project.submitManagerReview(roles);
      expect(project.state).toBe(ProjectState.FINISHED);
    });

    test('should fail if project is not in manager-review state', () => {
      project.state = ProjectState.PEER_REVIEW;
      expect(() => project.submitManagerReview(roles)).toThrow();
    });
  });
});
