import { Entity } from 'common';
import { Project } from 'project/project';
import { User } from 'user/user';

export interface ProjectEntity extends Project, Entity {
  isOwner(user: User): boolean;
  isFormationState(): boolean;
  isPeerReviewState(): boolean;
  isManagerReviewState(): boolean;
  isFinishedState(): boolean;
}
