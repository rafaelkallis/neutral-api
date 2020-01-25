export enum ProjectState {
  FORMATION = 'formation',
  PEER_REVIEW = 'peer-review',
  MANAGER_REVIEW = 'manager-review',
  FINISHED = 'finished',
}

export enum ContributionVisibility {
  PUBLIC = 'public',
  PROJECT = 'project',
  SELF = 'self',
  NONE = 'none',
}

export enum SkipManagerReview {
  YES = 'yes',
  IF_CONSENSUAL = 'if-consensual',
  NO = 'no',
}

export interface Project {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  state: ProjectState;
  consensuality: number | null;
  contributionVisibility: ContributionVisibility;
  skipManagerReview: SkipManagerReview;
}
