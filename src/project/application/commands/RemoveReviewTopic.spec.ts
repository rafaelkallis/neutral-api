import td from 'testdouble';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { Project } from 'project/domain/project/Project';
import {
  RemoveReviewTopicCommand,
  RemoveReviewTopicCommandHandler,
} from 'project/application/commands/RemoveReviewTopic';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';

describe(RemoveReviewTopicCommand.name, () => {
  let scenario: UnitTestScenario<RemoveReviewTopicCommandHandler>;
  let removeReviewTopicCommandHandler: RemoveReviewTopicCommandHandler;
  let projectRepository: ProjectRepository;
  let authUser: User;
  let projectId: ProjectId;
  let project: Project;
  let reviewTopicId: ReviewTopicId;
  let removeReviewTopicCommand: RemoveReviewTopicCommand;
  let projectDto: ProjectDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(RemoveReviewTopicCommandHandler)
      .addProviderMock(ObjectMapper)
      .addProviderMock(ProjectRepository)
      .build();
    removeReviewTopicCommandHandler = scenario.subject;
    projectRepository = scenario.module.get(ProjectRepository);
    authUser = td.object();
    projectId = ProjectId.create();
    project = td.object();
    reviewTopicId = ReviewTopicId.create();
    removeReviewTopicCommand = new RemoveReviewTopicCommand(
      authUser,
      projectId.value,
      reviewTopicId.value,
    );

    td.when(projectRepository.findById(projectId)).thenResolve(project);

    const objectMapper = scenario.module.get(ObjectMapper);
    projectDto = td.object();
    td.when(
      objectMapper.map(project, ProjectDto, td.matchers.anything()),
    ).thenReturn(projectDto);
  });

  test('happy path', async () => {
    const actualProjectDto = await removeReviewTopicCommandHandler.handle(
      removeReviewTopicCommand,
    );
    expect(actualProjectDto).toBe(projectDto);
    td.verify(project.assertCreator(authUser));
    td.verify(project.removeReviewTopic(reviewTopicId));
  });
});
