import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add role metric table.
 */
export class AddRoleMetricMigration1610889568000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE role_metrics (
        id varchar(64) PRIMARY KEY,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL,
        project_id varchar(64) NOT NULL REFERENCES projects(id),
        milestone_id varchar(64) NOT NULL REFERENCES milestones(id),
        review_topic_id varchar(64) NOT NULL REFERENCES review_topics(id),
        role_id varchar(64) NOT NULL REFERENCES roles(id),
        contribution real NOT NULL,
        consensuality real NOT NULL,
        agreement real NOT NULL
      );

      CREATE INDEX role_metrics_project_id_index
        ON role_metrics (project_id);

      INSERT INTO role_metrics (
        SELECT
          object_id(),
          created_at,
          updated_at,
          project_id,
          milestone_id,
          review_topic_id,
          role_id,
          amount,
          1,
          1
        FROM contributions
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX role_metrics_project_id_index;
      
      DROP TABLE role_metrics;
    `);
  }
}
