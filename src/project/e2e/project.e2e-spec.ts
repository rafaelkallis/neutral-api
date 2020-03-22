import { Project } from 'project/domain/Project';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { TestScenario } from 'test/TestScenario';
import { User } from 'user/domain/User';
import { Role } from 'project/domain/Role';

describe('project (e2e)', () => {
  let scenario: TestScenario;
  let user: User;

  beforeEach(async () => {
    scenario = await TestScenario.create();
    user = await scenario.createUser();
    await scenario.authenticateUser(user);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  describe('/projects (GET)', () => {
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

  describe('/projects/:id (GET)', () => {
    let project: Project;

    beforeEach(async () => {
      project = scenario.modelFaker.project(user.id);
      project.consensuality = Consensuality.from(0.8);
      await scenario.projectRepository.persist(project);
    });

    test('happy path', async () => {
      const response = await scenario.session.get(
        `/projects/${project.id.value}`,
      );
      expect(response.status).toBe(200);
      // TODO more assertions?
    });
  });

  describe('/projects (POST)', () => {
    let title: string;
    let description: string;

    beforeEach(() => {
      title = scenario.primitiveFaker.words();
      description = scenario.primitiveFaker.paragraph();
    });

    test('happy path', async () => {
      const response = await scenario.session.post('/projects').send({
        title,
        description,
      });
      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title,
          description,
        }),
      );
      await scenario.projectRepository.findById(response.body.id);
    });
  });

  describe('/projects/:id (PATCH)', () => {
    let project: Project;
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
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ title }));
      const updatedProject = await scenario.projectRepository.findById(
        project.id,
      );
      expect(updatedProject.title.value).toEqual(title);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = scenario.modelFaker.user();
      await scenario.userRepository.persist(otherUser);
      project.creatorId = otherUser.id;
      await scenario.projectRepository.persist(project);
      const response = await scenario.session
        .patch(`/projects/${project.id.value}`)
        .send({ title });
      expect(response.status).toBe(403);
    });

    test('should fail if not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await scenario.projectRepository.persist(project);
      const response = await scenario.session
        .patch(`/projects/${project.id.value}`)
        .send({ title });
      expect(response.status).toBe(400);
    });
  });

  describe('/projects/:id/finish-formation (POST)', () => {
    let assignees: User[];
    let project: Project;
    let roles: Role[];

    beforeEach(async () => {
      assignees = [
        scenario.modelFaker.user(),
        scenario.modelFaker.user(),
        scenario.modelFaker.user(),
        scenario.modelFaker.user(),
      ];
      await scenario.userRepository.persist(...assignees);
      project = scenario.modelFaker.project(user.id);
      project.state = ProjectState.FORMATION;
      roles = [
        scenario.modelFaker.role(project.id, assignees[0].id),
        scenario.modelFaker.role(project.id, assignees[1].id),
        scenario.modelFaker.role(project.id, assignees[2].id),
        scenario.modelFaker.role(project.id, assignees[3].id),
      ];
      project.roles.addAll(roles);
      await scenario.projectRepository.persist(project);
    });

    test('happy path', async () => {
      const response = await scenario.session.post(
        `/projects/${project.id.value}/finish-formation`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      const updatedProject = await scenario.projectRepository.findById(
        project.id,
      );
      expect(updatedProject.state).toEqual(ProjectState.PEER_REVIEW);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = scenario.modelFaker.user();
      await scenario.userRepository.persist(otherUser);
      project.creatorId = otherUser.id;
      await scenario.projectRepository.persist(project);
      const response = await scenario.session.post(
        `/projects/${project.id.value}/finish-formation`,
      );
      expect(response.status).toBe(403);
    });

    test('should fail if project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await scenario.projectRepository.persist(project);
      const response = await scenario.session.post(
        `/projects/${project.id}/finish-formation`,
      );
      expect(response.status).toBe(400);
    });

    test('should fail if a role has no user assigned', async () => {
      roles[1].assigneeId = null;
      await scenario.projectRepository.persist(project);
      const response = await scenario.session.post(
        `/projects/${project.id}/finish-formation`,
      );
      expect(response.status).toBe(400);
    });
  });

  describe('/projects/:id (DELETE)', () => {
    let project: Project;

    beforeEach(async () => {
      project = scenario.modelFaker.project(user.id);
      await scenario.projectRepository.persist(project);
    });

    test('happy path', async () => {
      const response = await scenario.session.delete(
        `/projects/${project.id.value}`,
      );
      expect(response.status).toBe(204);
      expect(response.body).toBeDefined();
      await expect(
        scenario.projectRepository.exists(project.id),
      ).resolves.toBeFalsy();
    });
  });
});
