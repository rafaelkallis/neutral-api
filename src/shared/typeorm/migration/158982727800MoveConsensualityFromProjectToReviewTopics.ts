import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Move consensuality from project to review topics
 */
export class MoveConsensualityFromProjectToReviewTopicsMigration1589827278000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE review_topics ADD COLUMN consensuality real;
      UPDATE review_topics 
        SET consensuality = (
          SELECT projects.consensuality 
          FROM projects
          WHERE projects.id = review_topics.project_id
        );

      ALTER TABLE projects DROP COLUMN consensuality;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects ADD COLUMN consensuality real;
      UPDATE projects 
        SET consensuality = (
          SELECT AVG(review_topics.consensuality) 
          FROM review_topics
          WHERE review_topics.project_id = projects.id
        );

      ALTER TABLE review_topics DROP COLUMN consensuality;
    `);
  }
}
