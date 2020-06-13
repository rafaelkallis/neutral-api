import td from 'testdouble';
import { User } from 'user/domain/User';
import { Project } from 'project/domain/project/Project';
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
  let peerReviewDtos: PeerReviewDto[];
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
    ).thenResolve(roleDtos);
    peerReviewDtos = [];
    td.when(
      objectMapper.mapArray(
        project.peerReviews.toArray(),
        PeerReviewDto,
        td.matchers.anything(),
      ),
    ).thenResolve(peerReviewDtos);
    reviewTopicDtos = [];
    td.when(
      objectMapper.mapArray(project.reviewTopics.toArray(), ReviewTopicDto, {
        authUser,
        project,
      }),
    ).thenResolve(reviewTopicDtos);
    contributionDtos = [];
    td.when(
      objectMapper.mapArray(project.contributions.toArray(), ContributionDto, {
        authUser,
        project,
      }),
    ).thenResolve(contributionDtos);
  });

  test('general', async () => {
    const projectDto = await projectDtoMap.map(project, { authUser });
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
});
