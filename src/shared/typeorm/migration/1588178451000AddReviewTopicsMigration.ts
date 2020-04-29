import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add review topics table.
 */
export class AddReviewTopicsMigration1588178451000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE review_topics (
        id varchar(64) PRIMARY KEY,
        project_id varchar(64) NOT NULL REFERENCES projects(id),
        title varchar(100) NOT NULL,
        description varchar(1024) NOT NULL,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL
      );

      CREATE INDEX review_topics_project_id_index
        ON review_topics (project_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX review_topics_project_id_index;
      
      DROP TABLE review_topics;
    `);
  }
}
