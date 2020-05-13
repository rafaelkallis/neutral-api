import td from 'testdouble';
import { Project } from 'project/domain/project/Project';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { ProjectApplicationService } from 'project/application/ProjectApplicationService';
import { SubmitPeerReviewsDto } from 'project/application/dto/SubmitPeerReviewsDto';
import { Role } from 'project/domain/role/Role';
import { User } from 'user/domain/User';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { UserRepository } from 'user/domain/UserRepository';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { UserFactory } from 'user/application/UserFactory';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';

describe(ProjectApplicationService.name + ' submit peer reviews', () => {
  let scenario: UnitTestScenario<ProjectApplicationService>;
  let projectApplication: ProjectApplicationService;

  let projectRepository: ProjectRepository;
  let objectMapper: ObjectMapper;
  let contributionsComputer: ContributionsComputer;
  let consensualityComputer: ConsensualityComputer;
  let creatorUser: User;
  let projectId: ProjectId;
  let project: Project;
  let authRole: Role;
  let reviewTopic: ReviewTopic;
  let expectedProjectDto: unknown;
  let submitPeerReviewsDto: SubmitPeerReviewsDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(ProjectApplicationService)
      .addProviderMock(ProjectRepository)
      .addProviderMock(UserRepository)
      .addProviderMock(UserFactory)
      .addProviderMock(ObjectMapper)
      .addProviderMock(DomainEventBroker)
      .addProviderMock(ContributionsComputer)
      .addProviderMock(ConsensualityComputer)
      .build();
    projectApplication = scenario.subject;

    projectRepository = scenario.module.get(ProjectRepository);
    objectMapper = scenario.module.get(ObjectMapper);
    contributionsComputer = scenario.module.get(ContributionsComputer);
    consensualityComputer = scenario.module.get(ConsensualityComputer);

    creatorUser = scenario.modelFaker.user();

    projectId = ProjectId.create();
    project = td.object();
    td.when(projectRepository.findById(projectId)).thenResolve(project);

    project.reviewTopics = td.object();
    reviewTopic = scenario.modelFaker.reviewTopic();
    td.when(project.reviewTopics.whereId(reviewTopic.id)).thenReturn(
      reviewTopic,
    );
    // TODO remove
    td.when(project.reviewTopics.first()).thenReturn(reviewTopic);

    project.roles = td.object();
    td.when(project.roles.isAnyAssignedToUser(creatorUser)).thenReturn(true);

    authRole = scenario.modelFaker.role();
    td.when(project.roles.findByAssignee(creatorUser)).thenReturn(authRole);

    submitPeerReviewsDto = new SubmitPeerReviewsDto({}, reviewTopic.id.value);

    expectedProjectDto = td.object();
    td.when(
      objectMapper.map(project, ProjectDto, td.matchers.anything()),
    ).thenReturn(expectedProjectDto);
  });

  test('happy path', async () => {
    await projectApplication.submitPeerReviews(
      creatorUser,
      projectId.value,
      submitPeerReviewsDto,
    );
    td.verify(
      project.submitPeerReviews(
        authRole.id,
        reviewTopic.id,
        td.matchers.isA(Array),
        contributionsComputer,
        consensualityComputer,
      ),
    );
    td.verify(projectRepository.persist(project));
  });
});
