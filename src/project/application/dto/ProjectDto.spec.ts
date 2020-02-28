import { User } from 'user/domain/User';
import { Project } from 'project/domain/Project';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { ModelFaker } from 'test/ModelFaker';

describe('project dto', () => {
  let modelFaker: ModelFaker;
  let owner: User;
  let user: User;
  let project: Project;

  beforeEach(async () => {
    modelFaker = new ModelFaker();
    owner = modelFaker.user();
    user = modelFaker.user();
    project = modelFaker.project(owner.id);
  });

  test('general', () => {
    const projectDto = ProjectDto.builder()
      .project(project)
      .authUser(user)
      .build();
    expect(projectDto).toEqual({
      id: project.id.value,
      title: project.title.value,
      description: project.description.value,
      creatorId: project.creatorId.value,
      state: project.state.value,
      consensuality: null,
      contributionVisibility: project.contributionVisibility.value,
      skipManagerReview: project.skipManagerReview.value,
      createdAt: project.createdAt.value,
      updatedAt: project.updatedAt.value,
    });
  });

  test('should expose consensuality if project owner', () => {
    project.consensuality = Consensuality.from(1);
    const projectDto = ProjectDto.builder()
      .project(project)
      .authUser(owner)
      .build();
    expect(projectDto.consensuality).toBeTruthy();
  });

  test('should not expose consensuality if not project owner', () => {
    project.consensuality = Consensuality.from(1);
    const projectDto = ProjectDto.builder()
      .project(project)
      .authUser(user)
      .build();
    expect(projectDto.consensuality).toBeFalsy();
  });
});
