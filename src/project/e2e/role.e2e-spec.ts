import { Project } from 'project/domain/Project';
import { Role } from 'project/domain/Role';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { User } from 'user/domain/User';
import { HttpStatus } from '@nestjs/common';
import { ProjectPeerReview } from 'project/domain/value-objects/states/ProjectPeerReview';

describe('roles (e2e)', () => {
  let scenario: IntegrationTestScenario;
  let user: User;
  let project: Project;
  let role: Role;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    user = await scenario.createUser();
    await scenario.authenticateUser(user);
    project = scenario.modelFaker.project(user.id);
    role = scenario.modelFaker.role(project.id);
    project.roles.add(role);
    await scenario.projectRepository.persist(project);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  describe('/projects/:project_id/roles (POST)', () => {
    let title: string;
    let description: string;

    beforeEach(() => {
      title = scenario.primitiveFaker.words();
      description = scenario.primitiveFaker.paragraph();
    });

    test('happy path', async () => {
      const response = await scenario.session
        .post(`/projects/${project.id.value}/roles`)
        .send({
          title,
          description,
        });
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: project.id.value,
          roles: expect.arrayContaining([
            {
              id: expect.any(String),
              projectId: project.id.value,
              assigneeId: null,
              title,
              description,
              contribution: null,
              hasSubmittedPeerReviews: false,
              createdAt: expect.any(Number),
              updatedAt: expect.any(Number),
            },
          ]),
        }),
      );
    });

    // TODO: should not be part of e2e tests!
    test('should fail when project is not in formation state', async () => {
      project.state = ProjectPeerReview.INSTANCE;
      await scenario.projectRepository.persist(project);
      const response = await scenario.session
        .post(`/projects/${project.id.value}/roles`)
        .send({
          title,
          description,
        });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('projects/:project_id/roles/:roleId (PATCH)', () => {
    let title: string;

    beforeEach(async () => {
      title = scenario.primitiveFaker.words();
    });

    test('happy path', async () => {
      const response = await scenario.session
        .patch(`/projects/${project.id.value}/roles/${role.id.value}`)
        .send({ title });
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: project.id.value,
          roles: expect.arrayContaining([
            expect.objectContaining({
              id: role.id.value,
              title,
            }),
          ]),
        }),
      );
    });

    // TODO: should be tested in e2e tests!
    test('should fail when project is not in formation state', async () => {
      project.state = ProjectPeerReview.INSTANCE;
      await scenario.projectRepository.persist(project);
      const response = await scenario.session
        .patch(`/projects/${project.id.value}/roles/${role.id.value}`)
        .send({ title });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    // TODO: should be tested in e2e tests!
    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = scenario.modelFaker.user();
      await scenario.userRepository.persist(otherUser);
      await scenario.authenticateUser(otherUser);
      const response = await scenario.session
        .patch(`/projects/${project.id.value}/roles/${role.id.value}`)
        .send({ title });
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });

    // TODO: should be tested in e2e tests!
    test('should fail is project owner is assigned', async () => {
      const response = await scenario.session
        .patch(`/projects/${project.id.value}/roles/${role.id.value}`)
        .send({ assigneeId: project.creatorId });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/projects/:project_id/roles/:roleId (DELETE)', () => {
    test('happy path', async () => {
      const response = await scenario.session.del(
        `/projects/${project.id.value}/roles/${role.id.value}`,
      );
      expect(response.status).toBe(HttpStatus.OK);
      const updatedProject = await scenario.projectRepository.findById(
        project.id,
      );
      if (!updatedProject) {
        throw new Error();
      }
      expect(updatedProject.roles.contains(role.id)).toBeFalsy();
    });
  });
});
