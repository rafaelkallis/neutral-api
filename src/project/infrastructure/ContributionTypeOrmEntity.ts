import { Column, ManyToOne, JoinColumn, Entity } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { Contribution } from 'project/domain/contribution/Contribution';

@Entity('contributions')
@TypeOrmEntity.register(Contribution)
export class ContributionTypeOrmEntity extends TypeOrmEntity {
  @ManyToOne(() => ProjectTypeOrmEntity, (project) => project.contributions)
  @JoinColumn({ name: 'project_id' })
  public project: ProjectTypeOrmEntity;

  @Column({ name: 'project_id' })
  public projectId: string;

  @Column({ name: 'role_id' })
  public roleId: string;

  @Column({ name: 'review_topic_id' })
  public reviewTopicId: string;

  @Column({ name: 'milestone_id' })
  public milestoneId: string;

  @Column({ name: 'amount', type: 'real' })
  public amount: number;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    project: ProjectTypeOrmEntity,
    projectId: string,
    roleId: string,
    reviewTopicId: string,
    milestoneId: string,
    amount: number,
  ) {
    super(id, createdAt, updatedAt);
    this.project = project;
    this.projectId = projectId;
    this.roleId = roleId;
    this.reviewTopicId = reviewTopicId;
    this.milestoneId = milestoneId;
    this.amount = amount;
  }
}
