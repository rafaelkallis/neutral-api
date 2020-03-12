import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add avatar to users.
 */
export class AddAvatarToUsersMigration1584023287000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users ADD COLUMN avatar varchar(255);
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users DROP COLUMN avatar;
    `);
  }
}
