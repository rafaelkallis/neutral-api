import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add peer review visibility to projects.
 */
export class AddPeerReviewVisibilityMigration1595594629000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects ADD COLUMN peer_review_visibility varchar(64);
      UPDATE projects SET peer_review_visibility = 'manager';
      ALTER TABLE projects ALTER COLUMN peer_review_visibility SET not null;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects DROP COLUMN peer_review_visibility;
    `);
  }
}
