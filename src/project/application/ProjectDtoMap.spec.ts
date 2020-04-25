import td from 'testdouble';
import { User } from 'user/domain/User';
import { Project } from 'project/domain/Project';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { ModelFaker } from 'test/ModelFaker';
import { ProjectDtoMap } from 'project/application/ProjectDtoMap';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { RoleDto } from 'project/application/dto/RoleDto';
import { PeerReviewDto } from './dto/PeerReviewDto';

describe('project dto map', () => {
  let objectMapper: ObjectMapper;
  let projectDtoMap: ProjectDtoMap;
  let modelFaker: ModelFaker;
  let owner: User;
  let user: User;
  let project: Project;

  beforeEach(() => {
    objectMapper = td.object();
    projectDtoMap = new ProjectDtoMap(objectMapper);
    modelFaker = new ModelFaker();
    owner = modelFaker.user();
    user = modelFaker.user();
    project = modelFaker.project(owner.id);

    td.when(
      objectMapper.mapArray(
        td.matchers.anything(),
        RoleDto,
        td.matchers.anything(),
      ),
    ).thenReturn([]);
    td.when(
      objectMapper.mapArray(
        td.matchers.anything(),
        PeerReviewDto,
        td.matchers.anything(),
      ),
    ).thenReturn([]);
  });

  test('general', () => {
    const projectDto = projectDtoMap.map(project, { authUser: user });
    expect(projectDto).toEqual({
      id: project.id.value,
      title: project.title.value,
      description: project.description.value,
      creatorId: project.creatorId.value,
      state: project.state.value,
      consensuality: null,
      contributionVisibility: project.contributionVisibility.value,
      skipManagerReview: project.skipManagerReview.value,
      roles: [],
      peerReviews: [],
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
    const projectDto = projectDtoMap.map(project, { authUser: user });
    expect(projectDto.consensuality).toBeNull();
  });
});
