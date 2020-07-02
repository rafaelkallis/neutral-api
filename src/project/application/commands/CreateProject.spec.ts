import td from 'testdouble';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UnitTestScenario } from 'test/UnitTestScenario';
import {
  CreateProjectCommand,
  CreateProjectCommandHandler,
} from 'project/application/commands/CreateProject';
import { ProjectDto } from '../dto/ProjectDto';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/project/value-objects/ProjectDescription';
import { ReadonlyProject } from 'project/domain/project/Project';
import { ProjectFactory } from '../ProjectFactory';
import {
  ContributionVisibilityValue,
  ContributionVisibility,
} from 'project/domain/project/value-objects/ContributionVisibility';
import {
  SkipManagerReviewValue,
  SkipManagerReview,
} from 'project/domain/project/value-objects/SkipManagerReview';

describe(CreateProjectCommand.name, () => {
  let scenario: UnitTestScenario<CreateProjectCommandHandler>;
  let commandHandler: CreateProjectCommandHandler;
  let projectRepository: ProjectRepository;
  let authUser: User;
  let title: string;
  let description: string;
  let contributionVisibility: ContributionVisibilityValue;
  let skipManagerReview: SkipManagerReviewValue;
  let command: CreateProjectCommand;
  let createdProject: ReadonlyProject;
  let projectDto: ProjectDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(CreateProjectCommandHandler)
      .addProviderMock(ObjectMapper)
      .addProviderMock(ProjectRepository)
      .addProviderMock(ProjectFactory)
      .build();
    commandHandler = scenario.subject;
    projectRepository = scenario.module.get(ProjectRepository);
    authUser = td.object(scenario.modelFaker.user());
    title = scenario.primitiveFaker.word();
    description = scenario.primitiveFaker.paragraph();
    contributionVisibility = ContributionVisibilityValue.PROJECT;
    skipManagerReview = SkipManagerReviewValue.NO;
    command = new CreateProjectCommand(
      authUser,
      title,
      description,
      contributionVisibility,
      skipManagerReview,
    );

    const projectFactory = scenario.module.get(ProjectFactory);
    createdProject = td.object();
    td.when(
      projectFactory.create({
        title: td.matchers.isA(ProjectTitle),
        description: td.matchers.isA(ProjectDescription),
        creator: authUser,
        contributionVisibility: ContributionVisibility.ofValue(
          contributionVisibility,
        ),
        skipManagerReview: SkipManagerReview.from(skipManagerReview),
      }),
    ).thenReturn(createdProject);

    const objectMapper = scenario.module.get(ObjectMapper);
    projectDto = td.object();
    td.when(
      objectMapper.map(createdProject, ProjectDto, td.matchers.anything()),
    ).thenResolve(projectDto);
  });

  test('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  test('happy path', async () => {
    const actualProjectDto = await commandHandler.handle(command);
    expect(actualProjectDto).toBe(projectDto);
    td.verify(projectRepository.persist(createdProject));
  });
});
