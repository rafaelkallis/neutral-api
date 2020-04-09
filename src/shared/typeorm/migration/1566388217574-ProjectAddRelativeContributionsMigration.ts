import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add state to Project
 */
export class ProjectAddRelativeContributionsMigration1566388217574
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects ADD COLUMN relative_contributions jsonb;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects DROP COLUMN relative_contributions;
    `);
  }
}
