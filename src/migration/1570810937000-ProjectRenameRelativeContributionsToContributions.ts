import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Rename relative contributions to contributions in Project
 */
export class ProjectRenameRelativeContributionsToContributionsMigration1570810937000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects RENAME COLUMN relative_contributions TO contributions;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects RENAME COLUMN contributions TO relative_contributions;
    `);
  }
}
