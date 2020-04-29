import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';

/**
 * ReviewTopic TypeOrm Entity
 */
@Entity('review_topics')
export class ReviewTopicTypeOrmEntity extends TypeOrmEntity {
  @ManyToOne(() => ProjectTypeOrmEntity)
  @JoinColumn({ name: 'project_id' })
  public project: ProjectTypeOrmEntity;

  @Column({ name: 'title' })
  public title: string;

  @Column({ name: 'description' })
  public description: string;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    project: ProjectTypeOrmEntity,
    title: string,
    description: string,
  ) {
    super(id, createdAt, updatedAt);
    this.project = project;
    this.title = title;
    this.description = description;
  }
}
