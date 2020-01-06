import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add "has submitted peer review" to roles.
 */
export class AddHasSubmittedPeerReviewsMigration1576331058000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE roles ADD COLUMN has_submitted_peer_reviews boolean;
      UPDATE roles 
        SET has_submitted_peer_reviews = exists(
          SELECT * 
          FROM peer_reviews
          WHERE peer_reviews.sender_role_id = roles.id
        );
      ALTER TABLE roles ALTER COLUMN has_submitted_peer_reviews SET not null;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE roles DROP COLUMN has_submitted_peer_reviews;
    `);
  }
}
