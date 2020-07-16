import { InternalProject, Project } from 'project/domain/project/Project';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { User } from 'user/domain/User';
import { Role } from 'project/domain/role/Role';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { PeerReviewProjectState } from 'project/domain/project/value-objects/states/PeerReviewProjectState';
import { FormationProjectState } from 'project/domain/project/value-objects/states/FormationProjectState';
import { ArchivedProjectState } from 'project/domain/project/value-objects/states/ArchivedProjectState';
import { FinishedProjectState } from 'project/domain/project/value-objects/states/FinishedProjectState';
import { getProjectStateValue } from 'project/domain/project/value-objects/states/ProjectStateValue';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { HttpStatus } from '@nestjs/common';
import { SkipManagerReviewValue } from 'project/domain/project/value-objects/SkipManagerReview';
import { ContributionVisibilityValue } from 'project/domain/project/value-objects/ContributionVisibility';

describe('project (e2e)', () => {
  let scenario: IntegrationTestScenario;
  let user: User;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    user = await scenario.createUser();
    await scenario.authenticateUser(user);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  describe('/projects?type=created (GET)', () => {
    test('happy path', async () => {
      const projects = [
        scenario.modelFaker.project(user.id),
        scenario.modelFaker.project(user.id),
        scenario.modelFaker.project(user.id),
      ];
      await scenario.projectRepository.persist(...projects);
      const response = await scenario.session
        .get('/projects')
        .query({ type: 'created' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      for (const project of projects) {
        expect(response.body).toContainEqual(
          expect.objectContaining({
            id: project.id.value,
          }),
        );
      }
    });
  });

  describe('/projects?type=assigned (GET)', () => {
    test('happy path', async () => {
      const creator = await scenario.createUser();
      const projects = [
        await scenario.createProject(creator),
        await scenario.createProject(creator),
        await scenario.createProject(creator),
      ];
      for (const project of projects) {
        const role = project.addRole(
          RoleTitle.from(''),
          RoleDescription.from(''),
        );
        project.assignUserToRole(user, role.id);
      }
      await scenario.projectRepository.persist(...projects);
      const response = await scenario.session
        .get('/projects')
        .query({ type: 'assigned' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      for (const project of projects) {
        expect(response.body).toContainEqual(
          expect.objectContaining({
            id: project.id.value,
          }),
        );
      }
    });
  });

  describe('/projects/:id (GET)', () => {
    let project: Project;

    beforeEach(async () => {
      project = scenario.modelFaker.project(user.id);
      await scenario.projectRepository.persist(project);
    });

    test('happy path', async () => {
      const response = await scenario.session.get(
        `/projects/${project.id.value}`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: project.id.value,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
        title: project.title.value,
        description: project.description.value,
        meta: {},
        creatorId: project.creatorId.value,
        state: getProjectStateValue(project.state),
        skipManagerReview: project.skipManagerReview.value,
        contributionVisibility: project.contributionVisibility.asValue(),
        roles: [],
        peerReviews: [],
        reviewTopics: [],
        contributions: [],
      });
    });
  });

  describe('/projects (POST)', () => {
    let title: string;
    let description: string;
    let meta: Record<string, unknown>;
    let contributionVisibility: ContributionVisibilityValue;
    let skipManagerReview: SkipManagerReviewValue;

    beforeEach(() => {
      title = scenario.primitiveFaker.words();
      description = scenario.primitiveFaker.paragraph();
      meta = { custom1: 'custom1', custom2: 'custom2' };
      contributionVisibility = ContributionVisibilityValue.PROJECT;
      skipManagerReview = SkipManagerReviewValue.NO;
    });

    test('happy path', async () => {
      const response = await scenario.session.post('/projects').send({
        title,
        description,
        meta,
        contributionVisibility,
        skipManagerReview,
      });
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title,
          description,
          meta: expect.objectContaining(meta),
          contributionVisibility,
          skipManagerReview,
        }),
      );
      await scenario.projectRepository.findById(response.body.id);
    });

    test('meta is optional', async () => {
      const response = await scenario.session.post('/projects').send({
        title,
        description,
        contributionVisibility,
        skipManagerReview,
      });
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title,
          description,
          meta: expect.objectContaining({}),
          contributionVisibility,
          skipManagerReview,
        }),
      );
      await scenario.projectRepository.findById(response.body.id);
    });
  });

  describe('/projects/:id (PATCH)', () => {
    let project: InternalProject;
    let title: string;

    beforeEach(async () => {
      project = scenario.modelFaker.project(user.id);
      await scenario.projectRepository.persist(project);
      title = scenario.primitiveFaker.words();
    });

    test('happy path', async () => {
      const response = await scenario.session
        .patch(`/projects/${project.id.value}`)
        .send({ title });
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(expect.objectContaining({ title }));
      const updatedProject = await scenario.projectRepository.findById(
        project.id,
      );
      if (!updatedProject) {
        throw new Error();
      }
      expect(updatedProject.title.value).toEqual(title);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = scenario.modelFaker.user();
      await scenario.userRepository.persist(otherUser);
      await scenario.authenticateUser(otherUser);
      const response = await scenario.session
        .patch(`/projects/${project.id.value}`)
        .send({ title });
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });

    test('should fail if not in formation state', async () => {
      project.state = PeerReviewProjectState.INSTANCE;
      await scenario.projectRepository.persist(project);
      const response = await scenario.session
        .patch(`/projects/${project.id.value}`)
        .send({ title });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/projects/:id/finish-formation (POST)', () => {
    let assignees: User[];
    let project: InternalProject;
    let roles: Role[];
    let reviewTopics: ReviewTopic[];

    beforeEach(async () => {
      assignees = [
        await scenario.createUser(),
        await scenario.createUser(),
        await scenario.createUser(),
        await scenario.createUser(),
      ];
      project = await scenario.createProject(user);
      project.state = FormationProjectState.INSTANCE;
      roles = [
        scenario.modelFaker.role(assignees[0].id),
        scenario.modelFaker.role(assignees[1].id),
        scenario.modelFaker.role(assignees[2].id),
        scenario.modelFaker.role(assignees[3].id),
      ];
      project.roles.addAll(roles);
      reviewTopics = [
        scenario.modelFaker.reviewTopic(),
        scenario.modelFaker.reviewTopic(),
      ];
      project.reviewTopics.addAll(reviewTopics);
      await scenario.projectRepository.persist(project);
    });

    test('happy path', async () => {
      const response = await scenario.session.post(
        `/projects/${project.id.value}/finish-formation`,
      );
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toBeDefined();
      const updatedProject = await scenario.projectRepository.findById(
        project.id,
      );
      if (!updatedProject) {
        throw new Error();
      }
      expect(updatedProject.state).toEqual(PeerReviewProjectState.INSTANCE);

      for (const assignee of assignees) {
        const receivedEmails = await scenario.getReceivedEmails(assignee);
        expect(receivedEmails).toHaveLength(1);
        expect(receivedEmails[0].subject).toBe(
          `[Covee] peer-review requested in "${project.title.toString()}"`,
        );
      }
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = scenario.modelFaker.user();
      await scenario.userRepository.persist(otherUser);
      await scenario.authenticateUser(otherUser);
      const response = await scenario.session.post(
        `/projects/${project.id.value}/finish-formation`,
      );
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });

    test('should fail if project is not in formation state', async () => {
      project.state = PeerReviewProjectState.INSTANCE;
      await scenario.projectRepository.persist(project);
      const response = await scenario.session.post(
        `/projects/${project.id.value}/finish-formation`,
      );
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    test('should fail if a role has no user assigned', async () => {
      roles[1].assigneeId = null;
      await scenario.projectRepository.persist(project);
      const response = await scenario.session.post(
        `/projects/${project.id.value}/finish-formation`,
      );
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/projects/:id/archive (POST)', () => {
    let project: InternalProject;

    beforeEach(async () => {
      project = scenario.modelFaker.project(user.id);
      project.state = FinishedProjectState.INSTANCE;
      await scenario.projectRepository.persist(project);
    });

    test('happy path', async () => {
      const response = await scenario.session.post(
        `/projects/${project.id.value}/archive`,
      );
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: project.id.value,
          state: 'archived',
        }),
      );
      const updatedProject = await scenario.projectRepository.findById(
        project.id,
      );
      if (!updatedProject) {
        throw new Error();
      }
      expect(updatedProject.state).toBe(ArchivedProjectState.INSTANCE);
    });
  });
});
