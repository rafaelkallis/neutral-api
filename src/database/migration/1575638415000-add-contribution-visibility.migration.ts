import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add contribution visibility to projects.
 */
export class AddContributionVisibilityMigration1575638415000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects ADD COLUMN contribution_visibility varchar(255);
      UPDATE projects SET contribution_visibility = 'self';
      ALTER TABLE projects ALTER COLUMN contribution_visibility SET not null;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects DROP COLUMN contribution_visibility;
    `);
  }
}
