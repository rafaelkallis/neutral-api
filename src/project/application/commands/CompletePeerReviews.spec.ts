import td from 'testdouble';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { InternalProject } from 'project/domain/project/Project';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import {
  CompletePeerReviewsCommand,
  CompletePeerReviewsCommandHandler,
} from 'project/application/commands/CompletePeerReviews';
import { ProjectAnalyzer } from 'project/domain/ProjectAnalyzer';

describe('' + CompletePeerReviewsCommand.name, () => {
  let scenario: UnitTestScenario<CompletePeerReviewsCommandHandler>;
  let completePeerReviewsCommandHandler: CompletePeerReviewsCommandHandler;
  let projectAnalyzer: ProjectAnalyzer;
  let projectRepository: ProjectRepository;
  let authUser: User;
  let projectId: ProjectId;
  let project: InternalProject;
  let completePeerReviewsCommand: CompletePeerReviewsCommand;
  let projectDto: ProjectDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(CompletePeerReviewsCommandHandler)
      .addProviderMock(ObjectMapper)
      .addProviderMock(ProjectRepository)
      .addProviderMock(ProjectAnalyzer)
      .build();
    completePeerReviewsCommandHandler = scenario.subject;
    projectAnalyzer = scenario.module.get(ProjectAnalyzer);
    projectRepository = scenario.module.get(ProjectRepository);
    authUser = scenario.modelFaker.user();
    projectId = ProjectId.create();
    project = td.object();
    project.roles = td.object();
    completePeerReviewsCommand = new CompletePeerReviewsCommand(
      authUser,
      projectId,
    );

    td.when(projectRepository.findById(projectId)).thenResolve(project);

    const objectMapper = scenario.module.get(ObjectMapper);
    projectDto = td.object();
    td.when(
      objectMapper.map(project, ProjectDto, td.matchers.anything()),
    ).thenResolve(projectDto);
  });

  test('happy path', async () => {
    const actualProjectDto = await completePeerReviewsCommandHandler.handle(
      completePeerReviewsCommand,
    );
    expect(actualProjectDto).toBe(projectDto);
    td.verify(project.assertCreator(authUser));
    td.verify(project.completePeerReviews(projectAnalyzer));
    td.verify(projectRepository.persist(project));
  });
});
