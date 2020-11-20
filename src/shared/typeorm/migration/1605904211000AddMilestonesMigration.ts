import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add milestones table.
 */
export class AddMilestonesMigration1605904211000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE milestones (
        id varchar(64) PRIMARY KEY,
        project_id varchar(64) NOT NULL REFERENCES projects(id),
        title varchar(100) NOT NULL,
        description varchar(1024) NOT NULL,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL
      );

      CREATE INDEX milestones_project_id_index
        ON milestones (project_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX milestones_project_id_index;
      
      DROP TABLE milestones;
    `);
  }
}
