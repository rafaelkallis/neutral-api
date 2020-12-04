import { Column, ManyToOne, JoinColumn, Entity } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { Milestone } from 'project/domain/milestone/Milestone';
import { MilestoneStateValue } from 'project/domain/milestone/value-objects/states/MilestoneStateValue';

@Entity('milestones')
@TypeOrmEntity.register(Milestone)
export class MilestoneTypeOrmEntity extends TypeOrmEntity {
  @ManyToOne(() => ProjectTypeOrmEntity, (project) => project.milestones)
  @JoinColumn({ name: 'project_id' })
  public project: ProjectTypeOrmEntity;

  @Column({ name: 'project_id' })
  public projectId: string;

  @Column({ name: 'title' })
  public title: string;

  @Column({ name: 'description' })
  public description: string;

  @Column({ name: 'state', type: 'enum', enum: MilestoneStateValue })
  public state: MilestoneStateValue;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    project: ProjectTypeOrmEntity,
    projectId: string,
    title: string,
    description: string,
    state: MilestoneStateValue,
  ) {
    super(id, createdAt, updatedAt);
    this.project = project;
    this.projectId = projectId;
    this.title = title;
    this.description = description;
    this.state = state;
  }
}
