import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add milestone metric table.
 */
export class AddMilestoneMetricMigration1611397932000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE milestone_metrics (
        id varchar(64) PRIMARY KEY,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL,
        project_id varchar(64) NOT NULL REFERENCES projects(id),
        milestone_id varchar(64) NOT NULL REFERENCES milestones(id),
        review_topic_id varchar(64) NOT NULL REFERENCES review_topics(id),
        contribution_symmetry real NOT NULL,
        consensuality real NOT NULL,
        agreement real NOT NULL
      );

      CREATE INDEX milestone_metrics_project_id_index
        ON milestone_metrics (project_id);

      INSERT INTO milestone_metrics (
        SELECT
          object_id(),
          (EXTRACT(epoch from now()) * 1000)::bigint,
          (EXTRACT(epoch from now()) * 1000)::bigint,
          milestones.project_id,
          milestones.id,
          review_topics.id,
          1,
          1,
          1
        FROM milestones
        JOIN review_topics ON milestones.project_id = review_topics.project_id
        WHERE milestones.state IN ('manager-review', 'finished')
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX milestone_metrics_project_id_index;
      
      DROP TABLE milestone_metrics;
    `);
  }
}
