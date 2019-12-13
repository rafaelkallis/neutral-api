import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Rename "reviewerRoleId" to "senderRoleId" and "revieweeRoleId" to "receiverRoleId" in Peer Review
 */
export class PeerReviewRename1576248460000 implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE peer_reviews RENAME COLUMN reviewer_role_id TO sender_role_id;
      ALTER TABLE peer_reviews RENAME COLUMN reviewee_role_id TO receiver_role_id;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE peer_reviews RENAME COLUMN sender_role_id TO reviewer_role_id;
      ALTER TABLE peer_reviews RENAME COLUMN receiver_role_id TO reviewee_role_id;
    `);
  }
}
