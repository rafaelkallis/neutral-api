import td from 'testdouble';
import { User } from 'user/domain/User';
import { Project, CreateProjectOptions } from 'project/domain/Project';
import { SkipManagerReview } from 'project/domain/value-objects/SkipManagerReview';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/value-objects/ProjectDescription';
import { ProjectCreatedEvent } from 'project/domain/events/ProjectCreatedEvent';
import { ProjectFormationStartedEvent } from 'project/domain/events/ProjectFormationStartedEvent';
import { PeerReviewsSubmittedEvent } from 'project/domain/events/PeerReviewsSubmittedEvent';
import { FinalPeerReviewSubmittedEvent } from 'project/domain/events/FinalPeerReviewSubmittedEvent';
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
import { ProjectFormation } from 'project/domain/value-objects/states/ProjectFormation';
import { ProjectPeerReview } from 'project/domain/value-objects/states/ProjectPeerReview';
import { ProjectManagerReview } from 'project/domain/value-objects/states/ProjectManagerReview';
import { ProjectFinished } from 'project/domain/value-objects/states/ProjectFinished';

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
      const createdProject = Project.create(createProjectOptions);
      expect(createdProject.domainEvents).toEqual([
        expect.any(ProjectCreatedEvent),
        expect.any(ProjectFormationStartedEvent),
      ]);
    });
  });

  test('update project', () => {
    const title = ProjectTitle.from(primitiveFaker.words());
    project.state = td.object();
    project.update(title);
    td.verify(project.state.update(project, title, undefined));
  });

  test('archive project', () => {
    project.state = td.object();
    project.archive();
    td.verify(project.state.archive(project));
  });

  test('add role', () => {
    const title = RoleTitle.from(primitiveFaker.words());
    const description = RoleDescription.from(primitiveFaker.paragraph());
    const addedRole: Role = td.object();
    project.state = td.object();
    td.when(project.state.addRole(project, title, description)).thenReturn(
      addedRole,
    );
    const actualRole = project.addRole(title, description);
    expect(actualRole).toBe(addedRole);
  });

  test('update role', () => {
    const title = RoleTitle.from(primitiveFaker.words());
    const roleToUpdate = roles[0];
    project.state = td.object();
    project.updateRole(roleToUpdate.id, title);
    td.verify(
      project.state.updateRole(project, roleToUpdate.id, title, undefined),
    );
  });

  test('remove role', () => {
    const roleToRemove = roles[0];
    project.state = td.object();
    project.removeRole(roleToRemove.id);
    td.verify(project.state.removeRole(project, roleToRemove.id));
  });

  test('assign user to role', () => {
    const userToAssign = modelFaker.user();
    const roleToBeAssigned = roles[0];
    project.state = td.object();
    project.assignUserToRole(userToAssign, roleToBeAssigned.id);
    td.verify(
      project.state.assignUserToRole(
        project,
        userToAssign,
        roleToBeAssigned.id,
      ),
    );
  });

  test('unassign', () => {
    const roleToUnassign = roles[0];
    roleToUnassign.assigneeId = UserId.create();
    project.state = td.object();
    project.unassign(roleToUnassign.id);
    td.verify(project.state.unassign(project, roleToUnassign.id));
  });

  test('finish formation', () => {
    project.state = td.object();
    project.finishFormation();
    td.verify(project.state.finishFormation(project));
  });

  describe('submit peer reviews', () => {
    let submittedPeerReviews: [RoleId, PeerReviewScore][];
    let consensuality: Consensuality;

    beforeEach(() => {
      project.skipManagerReview = SkipManagerReview.NO;
      project.state = ProjectPeerReview.INSTANCE;
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
          roles[0].id,
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
          project.state.equals(ProjectManagerReview.INSTANCE),
        ).toBeTruthy();
        for (const role of roles) {
          expect(role.contribution).toEqual(expect.any(Contribution));
        }
        expect(project.consensuality).toEqual(consensuality);
      });

      test('final peer review, should skip manager review if "skipManagerReview" is "yes"', () => {
        project.skipManagerReview = SkipManagerReview.YES;
        project.submitPeerReviews(
          roles[0].id,
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(project.state).toBe(ProjectFinished.INSTANCE);
      });

      test('final peer review, should skip manager review if "skipManagerReview" is "if-consensual" and reviews are consensual', () => {
        project.skipManagerReview = SkipManagerReview.IF_CONSENSUAL;
        jest.spyOn(consensuality, 'isConsensual').mockReturnValue(true);
        project.submitPeerReviews(
          roles[0].id,
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(project.state).toBe(ProjectFinished.INSTANCE);
      });

      test('final peer review, should not skip manager review if "skipManagerReview" is "if-consensual" and reviews are not consensual', () => {
        project.skipManagerReview = SkipManagerReview.IF_CONSENSUAL;
        jest.spyOn(consensuality, 'isConsensual').mockReturnValue(false);
        project.submitPeerReviews(
          roles[0].id,
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(project.state).toBe(ProjectManagerReview.INSTANCE);
      });

      test('final peer review, should not skip manager review if "skipManagerReview" is "no"', () => {
        project.skipManagerReview = SkipManagerReview.NO;
        project.submitPeerReviews(
          roles[0].id,
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        expect(project.state).toBe(ProjectManagerReview.INSTANCE);
      });

      test('not final peer review, should not compute contributions and consensuality', () => {
        roles[1].hasSubmittedPeerReviews = HasSubmittedPeerReviews.FALSE;
        project.submitPeerReviews(
          roles[0].id,
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        );
        for (const role of project.roles) {
          expect(role.contribution).toBeNull();
        }
        expect(project.state).toBe(ProjectPeerReview.INSTANCE);
      });
    });

    test('should fail if project is not in peer-review state', () => {
      project.state = ProjectFormation.INSTANCE;
      expect(() =>
        project.submitPeerReviews(
          roles[0].id,
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
          roles[0].id,
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
          roles[0].id,
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
          roles[0].id,
          submittedPeerReviews,
          contributionsComputer,
          consensualityComputer,
        ),
      ).toThrow(expect.any(PeerReviewRoleMismatchException));
    });
  });

  describe('submit manager review', () => {
    beforeEach(() => {
      project.state = ProjectManagerReview.INSTANCE;
    });

    test('happy path', () => {
      project.submitManagerReview();
      expect(project.state).toBe(ProjectFinished.INSTANCE);
    });

    test('should fail if project is not in manager-review state', () => {
      project.state = ProjectPeerReview.INSTANCE;
      expect(() => project.submitManagerReview()).toThrow();
    });
  });
});
