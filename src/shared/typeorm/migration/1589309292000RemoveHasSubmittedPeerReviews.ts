import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Remove has_submitted_peer_reviews from role
 */
export class RemoveHasSubmittedPeerReviewsMigration1589309292000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE roles DROP COLUMN has_submitted_peer_reviews;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
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
}
