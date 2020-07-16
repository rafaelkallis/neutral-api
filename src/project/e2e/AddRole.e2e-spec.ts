import { InternalProject } from 'project/domain/project/Project';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { User } from 'user/domain/User';
import { HttpStatus } from '@nestjs/common';

describe('/projects/:project_id/roles (POST)', () => {
  let scenario: IntegrationTestScenario;
  let creator: User;
  let project: InternalProject;
  let title: string;
  let description: string;
  let assignee: User;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    creator = await scenario.createUser();
    await scenario.authenticateUser(creator);
    project = await scenario.createProject(creator);
    title = scenario.primitiveFaker.words();
    description = scenario.primitiveFaker.paragraph();
    assignee = await scenario.createUser();
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('should add role', async () => {
    const response = await scenario.session
      .post(`/projects/${project.id.value}/roles`)
      .send({ title, description });
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
            createdAt: expect.any(Number),
            updatedAt: expect.any(Number),
          },
        ]),
      }),
    );
  });

  test('when "assigneeId" is present, should assign user', async () => {
    const response = await scenario.session
      .post(`/projects/${project.id.value}/roles`)
      .send({ title, description, assigneeId: assignee.id.value });
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: project.id.value,
        roles: expect.arrayContaining([
          {
            id: expect.any(String),
            projectId: project.id.value,
            assigneeId: assignee.id.value,
            title,
            description,
            contribution: null,
            createdAt: expect.any(Number),
            updatedAt: expect.any(Number),
          },
        ]),
      }),
    );
    const receivedEmailsOfAssignee = await scenario.getReceivedEmails(assignee);
    expect(receivedEmailsOfAssignee).toHaveLength(1);
    expect(receivedEmailsOfAssignee[0].subject).toBe(
      `[Covee] new assignment in "${project.title.toString()}"`,
    );
  });

  test('when "assigneeEmail" is present, should assign user', async () => {
    const response = await scenario.session
      .post(`/projects/${project.id.value}/roles`)
      .send({ title, description, assigneeEmail: assignee.email.value });
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: project.id.value,
        roles: expect.arrayContaining([
          {
            id: expect.any(String),
            projectId: project.id.value,
            assigneeId: assignee.id.value,
            title,
            description,
            contribution: null,
            createdAt: expect.any(Number),
            updatedAt: expect.any(Number),
          },
        ]),
      }),
    );
    const receivedEmailsOfAssignee = await scenario.getReceivedEmails(assignee);
    expect(receivedEmailsOfAssignee).toHaveLength(1);
    expect(receivedEmailsOfAssignee[0].subject).toBe(
      `[Covee] new assignment in "${project.title.toString()}"`,
    );
  });

  test('when "assigneeEmail" is present and email is not register should invite user', async () => {
    const email = scenario.valueObjectFaker.user.email();
    const response = await scenario.session
      .post(`/projects/${project.id.value}/roles`)
      .send({ title, description, assigneeEmail: email.value });
    expect(response.status).toBe(HttpStatus.CREATED);
    const createdUser = await scenario.userRepository.findByEmail(email);
    if (!createdUser) {
      throw new Error('no user created');
    }
    if (
      !response.body.roles.some(
        (role: any) => role.assigneeId === createdUser.id.value,
      )
    ) {
      throw new Error('no role created or user was not assigned');
    }
    const receivedEmailsOfAssignee = await scenario.getReceivedEmails(
      createdUser,
    );
    expect(receivedEmailsOfAssignee).toHaveLength(1);
    expect(receivedEmailsOfAssignee[0].subject).toBe(
      `[Covee] new assignment in "${project.title.toString()}"`,
    );
  });
});
