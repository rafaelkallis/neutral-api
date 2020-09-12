import { Column, ManyToOne, JoinColumn, Entity } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ReviewTopicInputTypeOrmEntity } from './ReviewTopicInputTypeOrmEntity';

@Entity('review_topics')
@TypeOrmEntity.register(ReviewTopic)
export class ReviewTopicTypeOrmEntity extends TypeOrmEntity {
  @ManyToOne(() => ProjectTypeOrmEntity, (project) => project.reviewTopics)
  @JoinColumn({ name: 'project_id' })
  public project: ProjectTypeOrmEntity;

  @Column({ name: 'project_id' })
  public projectId: string;

  @Column({ name: 'title' })
  public title: string;

  @Column({ name: 'description' })
  public description: string;

  @Column(() => ReviewTopicInputTypeOrmEntity, { prefix: false })
  public input: ReviewTopicInputTypeOrmEntity;

  @Column({ name: 'consensuality', type: 'real', nullable: true })
  public consensuality: number | null;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    project: ProjectTypeOrmEntity,
    projectId: string,
    title: string,
    description: string,
    input: ReviewTopicInputTypeOrmEntity,
    consensuality: number | null,
  ) {
    super(id, createdAt, updatedAt);
    this.project = project;
    this.projectId = projectId;
    this.title = title;
    this.description = description;
    this.input = input;
    this.consensuality = consensuality;
  }
}
