import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';

@Entity('contributions')
export class ContributionTypeOrmEntity extends TypeOrmEntity {
  @ManyToOne(() => ProjectTypeOrmEntity, (project) => project.contributions)
  @JoinColumn({ name: 'project_id' })
  public project: ProjectTypeOrmEntity;

  @Column({ name: 'role_id' })
  public roleId: string;

  @Column({ name: 'review_topic_id' })
  public reviewTopicId: string;

  @Column({ name: 'amount', type: 'real' })
  public amount: number;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    project: ProjectTypeOrmEntity,
    roleId: string,
    reviewTopicId: string,
    amount: number,
  ) {
    super(id, createdAt, updatedAt);
    this.project = project;
    this.roleId = roleId;
    this.reviewTopicId = reviewTopicId;
    this.amount = amount;
  }
}
