import { UserModel } from 'user';
import { ProjectModel } from 'project';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { ModelFaker } from 'test';

describe('project dto', () => {
  let modelFaker: ModelFaker;
  let owner: UserModel;
  let user: UserModel;
  let project: ProjectModel;

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
      id: project.id,
      title: project.title,
      description: project.description,
      creatorId: project.creatorId,
      state: project.state,
      consensuality: null,
      contributionVisibility: project.contributionVisibility,
      skipManagerReview: project.skipManagerReview,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    });
  });

  test('should expose consensuality if project owner', () => {
    project.consensuality = 1;
    const projectDto = ProjectDto.builder()
      .project(project)
      .authUser(owner)
      .build();
    expect(projectDto.consensuality).toBeTruthy();
  });

  test('should not expose consensuality if not project owner', () => {
    project.consensuality = 1;
    const projectDto = ProjectDto.builder()
      .project(project)
      .authUser(user)
      .build();
    expect(projectDto.consensuality).toBeFalsy();
  });
});
