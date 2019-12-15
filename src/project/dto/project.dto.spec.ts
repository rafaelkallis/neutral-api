import { ProjectEntity } from 'project';
import { ProjectDtoBuilder } from 'project/dto/project.dto';
import { entityFaker } from 'test';

describe('project dto', () => {
  const owner = entityFaker.user();
  const user = entityFaker.user();
  let project: ProjectEntity;

  beforeEach(() => {
    project = entityFaker.project(owner.id);
  });

  test('general', () => {
    const projectDto = ProjectDtoBuilder.of(project)
      .withAuthUser(user)
      .build();
    expect(projectDto).toEqual({
      id: project.id,
      title: project.title,
      description: project.description,
      ownerId: project.ownerId,
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
    const projectDto = ProjectDtoBuilder.of(project)
      .withAuthUser(owner)
      .build();
    expect(projectDto.consensuality).toBeTruthy();
  });

  test('should not expose consensuality if not project owner', () => {
    project.consensuality = 1;
    const projectDto = ProjectDtoBuilder.of(project)
      .withAuthUser(user)
      .build();
    expect(projectDto.consensuality).toBeFalsy();
  });
});
