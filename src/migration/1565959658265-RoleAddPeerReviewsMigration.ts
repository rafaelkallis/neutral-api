import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add peer reviews to Role migration
 */
export class RoleAddPeerReviewsMigration1565959658265 implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE roles ADD COLUMN peer_reviews jsonb;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE roles DROP COLUMN peer_reviews;
    `);
  }
}
