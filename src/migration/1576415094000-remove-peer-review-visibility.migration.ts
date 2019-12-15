import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Remove peer review visibility from projects.
 */
export class RemovePeerReviewVisibilityMigration1576415094000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects DROP COLUMN peer_review_visibility;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects ADD COLUMN peer_review_visibility varchar(255);
      UPDATE projects SET peer_review_visibility = 'sent';
      ALTER TABLE projects ALTER COLUMN peer_review_visibility SET not null;
    `);
  }
}
