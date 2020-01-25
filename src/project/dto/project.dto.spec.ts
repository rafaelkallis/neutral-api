import { UserEntity } from 'user';
import { ProjectEntity } from 'project';
import { ProjectDto } from 'project/dto/project.dto';
import { EntityFaker } from 'test';

describe('project dto', () => {
  let entityFaker: EntityFaker;
  let owner: UserEntity;
  let user: UserEntity;
  let project: ProjectEntity;

  beforeEach(async () => {
    entityFaker = new EntityFaker();
    owner = entityFaker.user();
    user = entityFaker.user();
    project = entityFaker.project(owner.id);
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
