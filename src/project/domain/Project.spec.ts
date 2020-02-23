import { User } from 'user/domain/User';
import { Project, CreateProjectOptions } from 'project/domain/Project';
import { ModelFaker, PrimitiveFaker } from 'test';
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
import { RoleCreatedEvent } from 'project/domain/events/RoleCreatedEvent';
import { Role } from 'project/domain/Role';
import { PeerReview } from 'project/domain/PeerReview';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { FakeConsensualityComputerService } from 'project/infrastructure/FakeConsensualityComputer';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { FakeContributionsComputerService } from 'project/infrastructure/FakeContributionsComputerService';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { RoleTitle } from 'project/domain/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/value-objects/RoleDescription';
import { HasSubmittedPeerReviews } from 'project/domain/value-objects/HasSubmittedPeerReviews';
import { PeerReviewScore } from 'project/domain/value-objects/PeerReviewScore';
import { Contribution } from 'project/domain/value-objects/Contribution';
import { RoleCollection } from 'project/domain/RoleCollection';
import { PeerReviewCollection } from 'project/domain/PeerReviewCollection';

describe('project', () => {
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;
  let contributionsComputer: ContributionsComputer;
  let consensualityComputer: ConsensualityComputer;

  let creator: User;
  let project: Project;
  let roles: Role[];

  beforeEach(() => {
    primitiveFaker = new PrimitiveFaker();
    modelFaker = new ModelFaker();
    contributionsComputer = new FakeContributionsComputerService();
    consensualityComputer = new FakeConsensualityComputerService();

    creator = modelFaker.user();
    project = modelFaker.project(creator.id);
    roles = [
      modelFaker.role(project.id, creator.id),
      modelFaker.role(project.id),
      modelFaker.role(project.id),
      modelFaker.role(project.id),
    ];
    project.roles = new RoleCollection(roles);
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
      project = Project.create(createProjectOptions);
      expect(project.getDomainEvents()).toEqual([
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
      expect(project.getDomainEvents()).toEqual([
        expect.any(ProjectUpdatedEvent),
      ]);
    });

    test('should fail if project is not in formation state', () => {
      project.state = ProjectState.PEER_REVIEW;
      expect(() => project.update(title)).toThrow();
    });
  });

  describe('delete project', () => {
    test('happy path', () => {
      project.delete();
      expect(project.getDomainEvents()).toEqual([
        expect.any(ProjectDeletedEvent),
      ]);
    });

    test('should fail if project is not in formation state', () => {
      project.state = ProjectState.PEER_REVIEW;
      expect(() => project.delete()).toThrow();
    });
  });

  describe('add role', () => {
    let title: RoleTitle;
    let description: RoleDescription;

    beforeEach(() => {
      title = RoleTitle.from(primitiveFaker.words());
      description = RoleDescription.from(primitiveFaker.paragraph());
    });

    test('happy path', () => {
      const addedRole = project.addRole(title, description);
      expect(project.roles.exists(addedRole.id)).toBeTruthy();
      expect(project.getDomainEvents()).toContainEqual(
        expect.any(RoleCreatedEvent),
      );
    });

    test('should fail when project is not in formation state', () => {
      project.state = ProjectState.PEER_REVIEW;
      expect(() => project.addRole(title, description)).toThrow();
    });
  });

  describe('update role', () => {
    let title: RoleTitle;
    let roleToUpdate: Role;

    beforeEach(() => {
      title = RoleTitle.from(primitiveFaker.words());
      roleToUpdate = project.roles.toArray()[0];
    });

    test('happy path', () => {
      project.updateRole(roleToUpdate.id, title);
      expect(roleToUpdate.title).toEqual(title);
    });

    test('should fail if project is not in formation state', () => {
      project.state = ProjectState.PEER_REVIEW;
      expect(() => project.updateRole(roleToUpdate.id, title)).toThrow();
    });
  });

  describe('remove role', () => {
    let roleToRemove: Role;

    beforeEach(() => {
      roleToRemove = project.roles.toArray()[0];
    });

    test('happy path', () => {
      project.removeRole(roleToRemove.id);
      expect(project.roles.exists(roleToRemove.id)).toBeFalsy();
    });

    test('should fail if project is not in formation state', () => {
      project.state = ProjectState.PEER_REVIEW;
      expect(() => project.removeRole(roleToRemove.id)).toThrow();
    });
  });

  describe('assign user to role', () => {
    let userToAssign: User;
    let roleToAssign: Role;

    beforeEach(() => {
      userToAssign = modelFaker.user();
      roleToAssign = project.roles.toArray()[0];
    });

    test('happy path', () => {
      project.assignUserToRole(userToAssign, roleToAssign);
      expect(roleToAssign.assigneeId?.equals(userToAssign.id)).toBeTruthy();
    });

    test('should fail if project is not in formation state', () => {
      project.state = ProjectState.PEER_REVIEW;
      expect(() =>
        project.assignUserToRole(userToAssign, roleToAssign),
      ).toThrow();
    });

    test('should fail if user already assigned to another role in same project', () => {
      project.assignUserToRole(userToAssign, project.roles.toArray()[1]);
      expect(() =>
        project.assignUserToRole(userToAssign, roleToAssign),
      ).toThrow();
    });
  });

  describe('finish formation', () => {
    beforeEach(() => {
      project.state = ProjectState.FORMATION;
      for (const role of project.roles) {
        role.assigneeId = Id.create();
      }
    });

    test('happy path', () => {
      project.finishFormation();
      expect(project.getDomainEvents()).toEqual([
        expect.any(ProjectFormationFinishedEvent),
        expect.any(ProjectPeerReviewStartedEvent),
      ]);
    });

    test('should fail if project is not in formation state', () => {
      project.state = ProjectState.PEER_REVIEW;
      expect(() => project.finishFormation()).toThrow();
    });

    test('should fail if a role has no user assigned', () => {
      project.roles.toArray()[0].assigneeId = null;
      expect(() => project.finishFormation()).toThrow();
    });
  });

  describe('submit peer reviews', () => {
    let submittedPeerReviews: [Id, PeerReviewScore][];
    let consensuality: Consensuality;

    beforeEach(() => {
      project.skipManagerReview = SkipManagerReview.NO;
      project.state = ProjectState.PEER_REVIEW;
      roles[0].hasSubmittedPeerReviews = HasSubmittedPeerReviews.FALSE;
      roles[1].hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
      roles[2].hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
      roles[3].hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;

      const peerReviews: PeerReview[] = [];
      for (const senderRole of project.roles) {
        for (const receiverRole of project.roles) {
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

      consensuality = Consensuality.from(1);
      jest
        .spyOn(consensualityComputer, 'compute')
        .mockReturnValue(consensuality);
    });

    describe('happy path', () => {
      test('final peer review', () => {
        project.submitPeerReviews(
          roles[0],
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(project.getDomainEvents()).toContainEqual(
          expect.any(PeerReviewsSubmittedEvent),
        );
        expect(project.getDomainEvents()).toContainEqual(
          expect.any(FinalPeerReviewSubmittedEvent),
        );
        expect(project.state.equals(ProjectState.MANAGER_REVIEW)).toBeTruthy();
        for (const role of roles) {
          expect(role.contribution).toEqual(expect.any(Contribution));
        }
        expect(project.consensuality).toEqual(consensuality);
      });

      test('final peer review, should skip manager review if "skipManagerReview" is "yes"', () => {
        project.skipManagerReview = SkipManagerReview.YES;
        project.submitPeerReviews(
          roles[0],
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(project.state).toBe(ProjectState.FINISHED);
      });

      test('final peer review, should skip manager review if "skipManagerReview" is "if-consensual" and reviews are consensual', () => {
        project.skipManagerReview = SkipManagerReview.IF_CONSENSUAL;
        jest.spyOn(consensuality, 'isConsensual').mockReturnValue(true);
        project.submitPeerReviews(
          roles[0],
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(project.state).toBe(ProjectState.FINISHED);
      });

      test('final peer review, should not skip manager review if "skipManagerReview" is "if-consensual" and reviews are not consensual', () => {
        project.skipManagerReview = SkipManagerReview.IF_CONSENSUAL;
        jest.spyOn(consensuality, 'isConsensual').mockReturnValue(false);
        project.submitPeerReviews(
          roles[0],
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(project.state).toBe(ProjectState.MANAGER_REVIEW);
      });

      test('final peer review, should not skip manager review if "skipManagerReview" is "no"', () => {
        project.skipManagerReview = SkipManagerReview.NO;
        project.submitPeerReviews(
          roles[0],
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(project.state).toBe(ProjectState.MANAGER_REVIEW);
      });

      test('not final peer review, should not compute contributions and consensuality', () => {
        roles[1].hasSubmittedPeerReviews = HasSubmittedPeerReviews.FALSE;
        project.submitPeerReviews(
          roles[0],
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        for (const role of project.roles) {
          expect(role.contribution).toBeNull();
        }
        expect(project.state).toBe(ProjectState.PEER_REVIEW);
      });
    });

    test('should fail if project is not in peer-review state', () => {
      project.state = ProjectState.FORMATION;
      expect(() =>
        project.submitPeerReviews(
          roles[0],
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        ),
      ).toThrow();
    });

    test('should fail if peer reviews have been previously submitted', () => {
      roles[0].hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
      expect(() =>
        project.submitPeerReviews(
          roles[0],
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        ),
      ).toThrow();
    });

    test('should fail if a peer review is for non-existing peer', () => {
      submittedPeerReviews = [
        [Id.from(primitiveFaker.id()), PeerReviewScore.from(1 / 3)],
        [roles[2].id, PeerReviewScore.from(1 / 3)],
        [roles[3].id, PeerReviewScore.from(1 / 3)],
      ];
      expect(() =>
        project.submitPeerReviews(
          roles[0],
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        ),
      ).toThrow();
    });
  });

  describe('submit manager review', () => {
    beforeEach(() => {
      project.state = ProjectState.MANAGER_REVIEW;
    });

    test('happy path', () => {
      project.submitManagerReview();
      expect(project.state).toBe(ProjectState.FINISHED);
    });

    test('should fail if project is not in manager-review state', () => {
      project.state = ProjectState.PEER_REVIEW;
      expect(() => project.submitManagerReview()).toThrow();
    });
  });
});
