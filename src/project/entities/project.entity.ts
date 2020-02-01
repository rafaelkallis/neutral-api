import { Column, Entity } from 'typeorm';
import { AbstractEntity } from 'common';
import {
  Project,
  ProjectState,
  ContributionVisibility,
  SkipManagerReview,
} from 'project/project';

/**
 * Project Entity
 */
@Entity('projects')
export class ProjectEntity extends AbstractEntity implements Project {
  @Column({ name: 'title' })
  public title: string;

  @Column({ name: 'description' })
  public description: string;

  @Column({ name: 'creator_id' })
  public creatorId: string;

  @Column({ name: 'state', type: 'enum', enum: ProjectState })
  public state: ProjectState;

  @Column({ name: 'consensuality', type: 'real', nullable: true })
  public consensuality: number | null;

  @Column({
    name: 'contribution_visibility',
    type: 'enum',
    enum: ContributionVisibility,
  })
  public contributionVisibility: ContributionVisibility;

  @Column({
    name: 'skip_manager_review',
    type: 'enum',
    enum: SkipManagerReview,
  })
  public skipManagerReview: SkipManagerReview;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    title: string,
    description: string,
    creatorId: string,
    state: ProjectState,
    consensuality: number | null,
    contributionVisibility: ContributionVisibility,
    skipManagerReview: SkipManagerReview,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
    this.creatorId = creatorId;
    this.state = state;
    this.consensuality = consensuality;
    this.contributionVisibility = contributionVisibility;
    this.skipManagerReview = skipManagerReview;
  }
}
