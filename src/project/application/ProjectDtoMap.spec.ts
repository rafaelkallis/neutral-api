import td from 'testdouble';
import { User } from 'user/domain/User';
import { Project } from 'project/domain/project/Project';
import { Consensuality } from 'project/domain/project/value-objects/Consensuality';
import { ModelFaker } from 'test/ModelFaker';
import { ProjectDtoMap } from 'project/application/ProjectDtoMap';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { RoleDto } from 'project/application/dto/RoleDto';
import { PeerReviewDto } from './dto/PeerReviewDto';
import { getProjectStateValue } from 'project/domain/project/value-objects/states/ProjectStateValue';
import { ReviewTopicDto } from './dto/ReviewTopicDto';
import { ContributionDto } from './dto/ContributionDto';

describe('project dto map', () => {
  let objectMapper: ObjectMapper;
  let projectDtoMap: ProjectDtoMap;
  let modelFaker: ModelFaker;
  let owner: User;
  let authUser: User;
  let project: Project;

  let roleDtos: RoleDto[];
  let peerReviewDtos: RoleDto[];
  let reviewTopicDtos: ReviewTopicDto[];
  let contributionDtos: ContributionDto[];

  beforeEach(() => {
    objectMapper = td.object();
    projectDtoMap = new ProjectDtoMap(objectMapper);
    modelFaker = new ModelFaker();
    owner = modelFaker.user();
    authUser = modelFaker.user();
    project = modelFaker.project(owner.id);

    roleDtos = [];
    td.when(
      objectMapper.mapArray(
        project.roles.toArray(),
        RoleDto,
        td.matchers.anything(),
      ),
    ).thenReturn(roleDtos);
    peerReviewDtos = [];
    td.when(
      objectMapper.mapArray(
        project.peerReviews.toArray(),
        PeerReviewDto,
        td.matchers.anything(),
      ),
    ).thenReturn(peerReviewDtos);
    reviewTopicDtos = [];
    td.when(
      objectMapper.mapArray(project.reviewTopics.toArray(), ReviewTopicDto),
    ).thenReturn(reviewTopicDtos);
    contributionDtos = [];
    td.when(
      objectMapper.mapArray(project.contributions.toArray(), ContributionDto, {
        authUser,
        project,
      }),
    ).thenReturn(contributionDtos);
  });

  test('general', () => {
    const projectDto = projectDtoMap.map(project, { authUser });
    expect(projectDto).toEqual({
      id: project.id.value,
      title: project.title.value,
      description: project.description.value,
      creatorId: project.creatorId.value,
      state: getProjectStateValue(project.state),
      consensuality: null,
      contributionVisibility: project.contributionVisibility.value,
      skipManagerReview: project.skipManagerReview.value,
      roles: roleDtos,
      peerReviews: peerReviewDtos,
      reviewTopics: reviewTopicDtos,
      contributions: contributionDtos,
      createdAt: project.createdAt.value,
      updatedAt: project.updatedAt.value,
    });
  });

  test('should expose consensuality if project owner', () => {
    project.consensuality = Consensuality.from(1);
    const projectDto = projectDtoMap.map(project, { authUser: owner });
    expect(projectDto.consensuality).toBeTruthy();
  });

  test('should not expose consensuality if not project owner', () => {
    project.consensuality = Consensuality.from(1);
    const projectDto = projectDtoMap.map(project, { authUser: authUser });
    expect(projectDto.consensuality).toBeNull();
  });
});
