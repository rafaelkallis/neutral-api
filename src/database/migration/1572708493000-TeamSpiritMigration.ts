import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add team spirit to teams.
 */
export class TeamSpiritProjectMigration1572708493000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects ADD COLUMN team_spirit real;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects DROP COLUMN team_spirit;
    `);
  }
}
