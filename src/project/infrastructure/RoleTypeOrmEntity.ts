import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';

/**
 * Role TypeOrm Entity
 */
@Entity('roles')
export class RoleTypeOrmEntity extends TypeOrmEntity {
  @ManyToOne(() => ProjectTypeOrmEntity, (project) => project.roles)
  @JoinColumn({ name: 'project_id' })
  public project: ProjectTypeOrmEntity;

  @Column({ name: 'assignee_id', type: 'varchar', length: 20, nullable: true })
  public assigneeId: string | null;

  @Column({ name: 'title' })
  public title: string;

  @Column({ name: 'description' })
  public description: string;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    project: ProjectTypeOrmEntity,
    assigneeId: string | null,
    title: string,
    description: string,
  ) {
    super(id, createdAt, updatedAt);
    this.project = project;
    this.assigneeId = assigneeId;
    this.title = title;
    this.description = description;
  }
}
