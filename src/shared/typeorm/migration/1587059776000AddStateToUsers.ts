import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add state to users.
 */
export class AddStateToUsersMigration1587059776000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users ADD COLUMN state varchar(255);
      UPDATE users SET state = 'active';
      ALTER TABLE users ALTER COLUMN state SET not null;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users DROP COLUMN state;
    `);
  }
}
