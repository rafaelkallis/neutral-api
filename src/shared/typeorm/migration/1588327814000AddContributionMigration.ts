import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add contributions table.
 */
export class AddContributionsMigration1588327814000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE contributions (
        id varchar(64) PRIMARY KEY,
        project_id varchar(64) NOT NULL REFERENCES projects(id),
        role_id varchar(64) NOT NULL REFERENCES roles(id),
        review_topic_id varchar(64) NOT NULL REFERENCES review_topics(id),
        amount real NOT NULL,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL
      );

      CREATE INDEX contributions_project_id_index
        ON contributions (project_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX contributions_project_id_index;
      
      DROP TABLE contributions;
    `);
  }
}
