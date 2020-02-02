import { ModelFactoryService } from 'common/domain/ModelFactoryService';
import {
  ContributionVisibility,
  SkipManagerReview,
  ProjectModel,
  ProjectState,
} from 'project';

export interface CreateProjectOptions {
  title: string;
  description: string;
  creatorId: string;
  contributionVisibility?: ContributionVisibility;
  skipManagerReview?: SkipManagerReview;
}

export class ProjectModelFactoryService extends ModelFactoryService {
  /**
   *
   */
  public createProject(projectOptions: CreateProjectOptions): ProjectModel {
    const projectId = this.createId();
    const createdAt = Date.now();
    const updatedAt = Date.now();
    const { title, description, creatorId } = projectOptions;
    const state = ProjectState.FORMATION;
    const consensuality = null;
    const contributionVisibility =
      projectOptions.contributionVisibility || ContributionVisibility.SELF;
    const skipManagerReview =
      projectOptions.skipManagerReview || SkipManagerReview.NO;
    return new ProjectModel(
      projectId,
      createdAt,
      updatedAt,
      title,
      description,
      creatorId,
      state,
      consensuality,
      contributionVisibility,
      skipManagerReview,
    );
  }
}
