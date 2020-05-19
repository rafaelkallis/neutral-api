import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Normalize contributions, move projects.contributions -> roles.contribution.
 */
export class AddReviewTopicToPeerReviewMigration1588452568000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO review_topics (
          SELECT 
            object_id(),
            id,
            'Contribution',
            '',
            created_at,
            updated_at 
          FROM projects
        );
      
      ALTER TABLE peer_reviews ADD COLUMN review_topic_id varchar(64) REFERENCES review_topics(id);

      UPDATE peer_reviews
        SET review_topic_id = review_topics.id
        FROM review_topics
        WHERE peer_reviews.project_id = review_topics.project_id;
      
      ALTER TABLE peer_reviews ALTER COLUMN review_topic_id SET not null;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE peer_reviews DROP COLUMN review_topic_id;

      DELETE FROM review_topics;
    `);
  }
}
