import td from 'testdouble';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { InternalProject } from 'project/domain/project/Project';
import {
  SubmitPeerReviewsCommand,
  SubmitPeerReviewsCommandHandler,
} from './SubmitPeerReviews';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { SubmitPeerReviewsDto } from '../dto/SubmitPeerReviewsDto';
import { Role } from 'project/domain/role/Role';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { Milestone } from 'project/domain/milestone/Milestone';

describe('' + SubmitPeerReviewsCommand.name, () => {
  let scenario: UnitTestScenario<SubmitPeerReviewsCommandHandler>;
  let submitPeerReviewsCommandHandler: SubmitPeerReviewsCommandHandler;
  let contributionsComputer: ContributionsComputer;
  let consensualityComputer: ConsensualityComputer;
  let projectRepository: ProjectRepository;
  let authUser: User;
  let authRole: Role;
  let projectId: ProjectId;
  let project: InternalProject;
  let milestone: Milestone;
  let submitPeerReviewsDto: SubmitPeerReviewsDto;
  let submitPeerReviewsCommand: SubmitPeerReviewsCommand;
  let submittedPeerReviews: PeerReviewCollection;
  let projectDto: ProjectDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(SubmitPeerReviewsCommandHandler)
      .addProviderMock(ObjectMapper)
      .addProviderMock(ProjectRepository)
      .addProviderMock(ContributionsComputer)
      .addProviderMock(ConsensualityComputer)
      .build();
    submitPeerReviewsCommandHandler = scenario.subject;
    contributionsComputer = scenario.module.get(ContributionsComputer);
    consensualityComputer = scenario.module.get(ConsensualityComputer);
    projectRepository = scenario.module.get(ProjectRepository);
    authUser = scenario.modelFaker.user();
    authRole = scenario.modelFaker.role();
    projectId = ProjectId.create();
    project = td.object();
    milestone = td.object();
    project.roles = td.object();
    project.milestones = td.object();
    submittedPeerReviews = td.object();
    submitPeerReviewsDto = td.object();
    submitPeerReviewsCommand = new SubmitPeerReviewsCommand(
      authUser,
      projectId.value,
      submitPeerReviewsDto,
    );

    td.when(projectRepository.findById(projectId)).thenResolve(project);
    td.when(project.roles.isAnyAssignedToUser(authUser)).thenReturn(true);
    td.when(project.roles.whereAssignee(authUser)).thenReturn(authRole);
    td.when(project.milestones.whereLatest()).thenReturn(milestone);
    td.when(
      submitPeerReviewsDto.asPeerReviewCollection(authRole.id, milestone),
    ).thenReturn(submittedPeerReviews);

    const objectMapper = scenario.module.get(ObjectMapper);
    projectDto = td.object();
    td.when(
      objectMapper.map(project, ProjectDto, td.matchers.anything()),
    ).thenResolve(projectDto);
  });

  test('happy path', async () => {
    const actualProjectDto = await submitPeerReviewsCommandHandler.handle(
      submitPeerReviewsCommand,
    );
    expect(actualProjectDto).toBe(projectDto);
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
