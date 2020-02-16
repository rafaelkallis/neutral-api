import { UserModel } from 'user/domain/UserModel';
import { ProjectModel } from 'project/domain/ProjectModel';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { ModelFaker } from 'test';
import { Consensuality } from 'project/domain/value-objects/Consensuality';

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
      contributionVisibility: project.contributionVisibility.toValue(),
      skipManagerReview: project.skipManagerReview.toValue(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
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
