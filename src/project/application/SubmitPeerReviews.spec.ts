import td from 'testdouble';
import { InternalProject } from 'project/domain/project/Project';
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
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { MagicLinkFactory } from 'shared/magic-link/MagicLinkFactory';
import { TokenManager } from 'shared/token/application/TokenManager';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';

describe(ProjectApplicationService.name + ' submit peer reviews', () => {
  let scenario: UnitTestScenario<ProjectApplicationService>;
  let projectApplication: ProjectApplicationService;

  let projectRepository: ProjectRepository;
  let objectMapper: ObjectMapper;
  let contributionsComputer: ContributionsComputer;
  let consensualityComputer: ConsensualityComputer;
  let creatorUser: User;
  let projectId: ProjectId;
  let project: InternalProject;
  let authRole: Role;
  let expectedProjectDto: ProjectDto;
  let submittedPeerReviews: PeerReviewCollection;
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
      .addProviderMock(TokenManager)
      .addProviderMock(MagicLinkFactory)
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

    project.roles = td.object();
    td.when(project.roles.isAnyAssignedToUser(creatorUser)).thenReturn(true);

    authRole = scenario.modelFaker.role();
    td.when(project.roles.whereAssignee(creatorUser)).thenReturn(authRole);

    submittedPeerReviews = td.object();
    submitPeerReviewsDto = td.object();
    td.when(
      submitPeerReviewsDto.asPeerReviewCollection(authRole.id),
    ).thenReturn(submittedPeerReviews);

    expectedProjectDto = td.object();
    td.when(
      objectMapper.map(project, ProjectDto, td.matchers.anything()),
    ).thenResolve(expectedProjectDto);
  });

  test('happy path', async () => {
    await projectApplication.submitPeerReviews(
      creatorUser,
      projectId.value,
      submitPeerReviewsDto,
    );
    td.verify(
      project.submitPeerReviews(
        submittedPeerReviews,
        contributionsComputer,
        consensualityComputer,
      ),
    );
    td.verify(projectRepository.persist(project));
  });
});
