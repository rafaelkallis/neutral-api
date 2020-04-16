import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * User migration
 */
export class DropUniqueUserEmailConstraintMigration1587070723000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users DROP CONSTRAINT users_email_key;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
    `);
  }
}
