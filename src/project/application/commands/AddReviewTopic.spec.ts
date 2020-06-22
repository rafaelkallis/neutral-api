import td from 'testdouble';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ProjectDto } from '../dto/ProjectDto';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { Project } from 'project/domain/project/Project';
import {
  AddReviewTopicCommand,
  AddReviewTopicCommandHandler,
} from 'project/application/commands/AddReviewTopic';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/review-topic/value-objects/ReviewTopicDescription';
import { ReviewTopicInput } from 'project/domain/review-topic/ReviewTopicInput';

describe(AddReviewTopicCommand.name, () => {
  let scenario: UnitTestScenario<AddReviewTopicCommandHandler>;
  let commandHandler: AddReviewTopicCommandHandler;
  let projectRepository: ProjectRepository;
  let authUser: User;
  let project: Project;
  let title: string;
  let description: string;
  let input: ReviewTopicInput;
  let command: AddReviewTopicCommand;
  let projectDto: ProjectDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(AddReviewTopicCommandHandler)
      .addProviderMock(ObjectMapper)
      .addProviderMock(ProjectRepository)
      .build();
    commandHandler = scenario.subject;
    projectRepository = scenario.module.get(ProjectRepository);
    authUser = scenario.modelFaker.user();
    project = scenario.modelFaker.project(authUser.id);
    title = scenario.primitiveFaker.word();
    description = scenario.primitiveFaker.paragraph();
    input = scenario.valueObjectFaker.reviewTopic.input();
    command = new AddReviewTopicCommand(
      authUser,
      project.id.value,
      title,
      description,
      input,
    );

    td.when(projectRepository.findById(project.id)).thenResolve(project);
    jest.spyOn(project, 'assertCreator');
    jest.spyOn(project, 'addReviewTopic');

    const objectMapper = scenario.module.get(ObjectMapper);
    projectDto = td.object();
    td.when(objectMapper.map(project, ProjectDto, { authUser })).thenResolve(
      projectDto,
    );
  });

  test('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  test('happy path', async () => {
    const actualProjectDto = await commandHandler.handle(command);
    expect(actualProjectDto).toBe(projectDto);
    expect(project.addReviewTopic).toHaveBeenCalledWith(
      ReviewTopicTitle.from(title),
      ReviewTopicDescription.from(description),
      input,
    );
  });
});
