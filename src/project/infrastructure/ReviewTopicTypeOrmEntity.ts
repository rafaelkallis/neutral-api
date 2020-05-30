import { Column, ManyToOne, JoinColumn } from 'typeorm';
import {
  AbstractTypeOrmEntity,
  TypeOrmEntity,
} from 'shared/infrastructure/TypeOrmEntity';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';

/**
 * ReviewTopic TypeOrm Entity
 */
@TypeOrmEntity(ReviewTopic, 'review_topics')
export class ReviewTopicTypeOrmEntity extends AbstractTypeOrmEntity {
  @ManyToOne(() => ProjectTypeOrmEntity, (project) => project.reviewTopics)
  @JoinColumn({ name: 'project_id' })
  public project: ProjectTypeOrmEntity;

  @Column({ name: 'title' })
  public title: string;

  @Column({ name: 'description' })
  public description: string;

  @Column({ name: 'consensuality', type: 'real', nullable: true })
  public consensuality: number | null;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    project: ProjectTypeOrmEntity,
    title: string,
    description: string,
    consensuality: number | null,
  ) {
    super(id, createdAt, updatedAt);
    this.project = project;
    this.title = title;
    this.description = description;
    this.consensuality = consensuality;
  }
}
