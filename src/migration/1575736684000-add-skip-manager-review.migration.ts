import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add skip-manager-review to projects.
 */
export class AddSkipManagerReviewMigration1575736684000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects ADD COLUMN skip_manager_review varchar(255);
      UPDATE projects SET skip_manager_review = 'no';
      ALTER TABLE projects ALTER COLUMN skip_manager_review SET not null;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects DROP COLUMN skip_manager_review;
    `);
  }
}
