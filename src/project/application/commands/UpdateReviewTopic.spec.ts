import td from 'testdouble';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { Project } from 'project/domain/project/Project';
import {
  UpdateReviewTopicCommand,
  UpdateReviewTopicCommandHandler,
} from 'project/application/commands/UpdateReviewTopic';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';

describe(UpdateReviewTopicCommand.name, () => {
  let scenario: UnitTestScenario<UpdateReviewTopicCommandHandler>;
  let commandHandler: UpdateReviewTopicCommandHandler;
  let projectRepository: ProjectRepository;
  let authUser: User;
  let project: Project;
  let reviewTopic: ReviewTopic;
  let newTitle: string;
  let command: UpdateReviewTopicCommand;
  let projectDto: ProjectDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(UpdateReviewTopicCommandHandler)
      .addProviderMock(ObjectMapper)
      .addProviderMock(ProjectRepository)
      .build();
    commandHandler = scenario.subject;
    projectRepository = scenario.module.get(ProjectRepository);
    authUser = scenario.modelFaker.user();
    project = scenario.modelFaker.project(authUser.id);
    reviewTopic = scenario.modelFaker.reviewTopic();
    project.reviewTopics.add(reviewTopic);
    newTitle = scenario.primitiveFaker.words();
    command = new UpdateReviewTopicCommand(
      authUser,
      project.id.value,
      reviewTopic.id.value,
      newTitle,
    );

    td.when(projectRepository.findById(project.id)).thenResolve(project);
    jest.spyOn(project, 'assertCreator');
    jest.spyOn(project, 'updateReviewTopic');

    const objectMapper = scenario.module.get(ObjectMapper);
    projectDto = td.object();
    td.when(
      objectMapper.map(project, ProjectDto, td.matchers.anything()),
    ).thenResolve(projectDto);
  });

  test('happy path', async () => {
    const actualProjectDto = await commandHandler.handle(command);
    expect(actualProjectDto).toBe(projectDto);
    expect(project.assertCreator).toHaveBeenCalledWith(authUser);
    expect(project.updateReviewTopic).toHaveBeenCalledWith(
      reviewTopic.id,
      ReviewTopicTitle.from(newTitle),
      undefined,
      undefined,
    );
  });
});
