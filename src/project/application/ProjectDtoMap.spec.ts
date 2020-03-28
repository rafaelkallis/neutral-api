import { User } from 'user/domain/User';
import { Project } from 'project/domain/Project';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { ModelFaker } from 'test/ModelFaker';
import { ProjectDtoMap } from 'project/application/ProjectDtoMap';
import { Mock } from 'test/Mock';
import { ModelMapper } from 'shared/model-mapper/ModelMapper';

describe('project dto map', () => {
  let projectDtoMap: ProjectDtoMap;
  let modelFaker: ModelFaker;
  let owner: User;
  let authUser: User;
  let project: Project;

  beforeEach(async () => {
    const modelMapper = Mock(ModelMapper);
    projectDtoMap = new ProjectDtoMap(modelMapper);
    modelFaker = new ModelFaker();
    owner = modelFaker.user();
    authUser = modelFaker.user();
    project = modelFaker.project(owner.id);
  });

  test('general', () => {
    const projectDto = projectDtoMap.map(project, { authUser });
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
    const projectDto = projectDtoMap.map(project, { authUser });
    expect(projectDto.consensuality).toBeTruthy();
  });

  test('should not expose consensuality if not project owner', () => {
    project.consensuality = Consensuality.from(1);
    const projectDto = projectDtoMap.map(project, { authUser });
    expect(projectDto.consensuality).toBeNull();
  });
});
