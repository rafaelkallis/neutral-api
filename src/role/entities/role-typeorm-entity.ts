import { Column, Entity } from 'typeorm';
import { TypeOrmEntity } from 'common';

/**
 * Role Entity
 */
@Entity('roles')
export class RoleTypeOrmEntity extends TypeOrmEntity {
  @Column({ name: 'project_id' })
  public projectId: string;

  @Column({ name: 'assignee_id', type: 'varchar', length: 20, nullable: true })
  public assigneeId: string | null;

  @Column({ name: 'title' })
  public title: string;

  @Column({ name: 'description' })
  public description: string;

  @Column({ name: 'contribution', type: 'real', nullable: true })
  public contribution: number | null;

  @Column({ name: 'has_submitted_peer_reviews' })
  public hasSubmittedPeerReviews: boolean;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    projectId: string,
    assigneeId: string | null,
    title: string,
    description: string,
    contribution: number | null,
    hasSubmittedPeerReviews: boolean,
  ) {
    super(id, createdAt, updatedAt);
    this.projectId = projectId;
    this.assigneeId = assigneeId;
    this.title = title;
    this.description = description;
    this.contribution = contribution;
    this.hasSubmittedPeerReviews = hasSubmittedPeerReviews;
  }
}
