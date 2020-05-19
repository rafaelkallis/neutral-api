import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';

/**
 * ReviewTopic TypeOrm Entity
 */
@Entity('review_topics')
export class ReviewTopicTypeOrmEntity extends TypeOrmEntity {
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
