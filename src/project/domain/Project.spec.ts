import { User } from 'user/domain/User';
import { Project, CreateProjectOptions } from 'project/domain/Project';
import { SkipManagerReview } from 'project/domain/value-objects/SkipManagerReview';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/value-objects/ProjectDescription';
import { ProjectCreatedEvent } from 'project/domain/events/ProjectCreatedEvent';
import { ProjectFormationStartedEvent } from 'project/domain/events/ProjectFormationStartedEvent';
import { ProjectUpdatedEvent } from 'project/domain/events/ProjectUpdatedEvent';
import { ProjectFormationFinishedEvent } from 'project/domain/events/ProjectFormationFinishedEvent';
import { ProjectPeerReviewStartedEvent } from 'project/domain/events/ProjectPeerReviewStartedEvent';
import { ProjectArchivedEvent } from 'project/domain/events/ProjectArchivedEvent';
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
import { PeerReviewCollection } from 'project/domain/PeerReviewCollection';
import { ModelFaker } from 'test/ModelFaker';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { PeerReviewRoleMismatchException } from 'project/domain/exceptions/PeerReviewRoleMismatchException';
import { PeerReviewsAlreadySubmittedException } from 'project/domain/exceptions/PeerReviewsAlreadySubmittedException';
import { UserId } from 'user/domain/value-objects/UserId';
import { RoleId } from 'project/domain/value-objects/RoleId';
import { UserAssignedEvent } from './events/UserAssignedEvent';
import { UserUnassignedEvent } from './events/UserUnassignedEvent';

describe(Project.name, () => {
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
    project.roles.addAll(roles);
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

  describe('archive project', () => {
    test('happy path', () => {
      project.archive();
      expect(project.state).toBe(ProjectState.ARCHIVED);
      expect(project.getDomainEvents()).toEqual([
        expect.any(ProjectArchivedEvent),
      ]);
    });

    test('should fail if project is not in formation state', () => {
      project.state = ProjectState.PEER_REVIEW;
      expect(() => project.archive()).toThrow();
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
      expect(project.roles.contains(addedRole.id)).toBeTruthy();
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
      roleToUpdate = roles[0];
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
      roleToRemove = roles[0];
    });

    test('happy path', () => {
      project.removeRole(roleToRemove.id);
      expect(project.roles.contains(roleToRemove.id)).toBeFalsy();
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
      roleToAssign = roles[0];
    });

    test('happy path', () => {
      project.assignUserToRole(userToAssign, roleToAssign.id);
      expect(roleToAssign.assigneeId?.equals(userToAssign.id)).toBeTruthy();
      expect(project.getDomainEvents()).toContainEqual(
        expect.any(UserAssignedEvent),
      );
    });

    test('when a different user is assigned, should unassign', () => {
      roleToAssign.assigneeId = UserId.create();
      project.assignUserToRole(userToAssign, roleToAssign.id);
      expect(roleToAssign.assigneeId?.equals(userToAssign.id)).toBeTruthy();
      expect(project.getDomainEvents()).toContainEqual(
        expect.any(UserUnassignedEvent),
      );
    });

    test('should fail if project is not in formation state', () => {
      project.state = ProjectState.PEER_REVIEW;
      expect(() =>
        project.assignUserToRole(userToAssign, roleToAssign.id),
      ).toThrow();
    });

    test('should fail if user already assigned to another role in same project', () => {
      project.assignUserToRole(userToAssign, roles[1].id);
      expect(() =>
        project.assignUserToRole(userToAssign, roleToAssign.id),
      ).toThrow();
    });
  });

  describe('unassign', () => {
    let roleToUnassign: Role;

    beforeEach(() => {
      roleToUnassign = roles[0];
      roleToUnassign.assigneeId = UserId.create();
    });

    test('happy path', () => {
      project.unassign(roleToUnassign.id);
      expect(roleToUnassign.assigneeId).toBeNull();
      expect(project.getDomainEvents()).toContainEqual(
        expect.any(UserUnassignedEvent),
      );
    });

    test('when project is not in formation state, should fail', () => {
      project.state = ProjectState.PEER_REVIEW;
      expect(() => project.unassign(roleToUnassign.id)).toThrow();
    });

    test('when no user is assigned, should fail', () => {
      roleToUnassign.assigneeId = null;
      expect(() => project.unassign(roleToUnassign.id)).toThrow();
    });
  });

  describe('finish formation', () => {
    beforeEach(() => {
      project.state = ProjectState.FORMATION;
      for (const role of project.roles) {
        role.assigneeId = UserId.create();
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
      roles[0].assigneeId = null;
      expect(() => project.finishFormation()).toThrow();
    });

    test('should fail if amount of roles is insufficient', () => {
      // TODO
      expect(() => project.finishFormation()).toThrow();
    });
  });

  describe('submit peer reviews', () => {
    let submittedPeerReviews: [RoleId, PeerReviewScore][];
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
      ).toThrow(expect.any(PeerReviewsAlreadySubmittedException));
    });

    test('should fail if a peer review miss a peer', () => {
      submittedPeerReviews = [
        [roles[1].id, PeerReviewScore.from(1 / 2)],
        [roles[3].id, PeerReviewScore.from(1 / 2)],
      ];
      expect(() =>
        project.submitPeerReviews(
          roles[0],
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        ),
      ).toThrow(expect.any(PeerReviewRoleMismatchException));
    });

    test('should fail if a peer review is for non-existing peer', () => {
      submittedPeerReviews = [
        [RoleId.from(primitiveFaker.id()), PeerReviewScore.from(1 / 3)],
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
      ).toThrow(expect.any(PeerReviewRoleMismatchException));
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
