import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Rename team spirit to consensuality in projects
 */
export class ProjectRenameTeamSpiritToConsensualityMigration1573457347000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects RENAME COLUMN team_spirit TO consensuality;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects RENAME COLUMN consensuality TO team_spirit;
    `);
  }
}
