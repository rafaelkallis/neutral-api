import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add state to Project
 */
export class ProjectAddStateMigration1566065005084
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects ADD COLUMN state varchar(255);
      UPDATE projects SET state = 'finished';
      ALTER TABLE projects ALTER COLUMN state SET not null;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects DROP COLUMN state;
    `);
  }
}
