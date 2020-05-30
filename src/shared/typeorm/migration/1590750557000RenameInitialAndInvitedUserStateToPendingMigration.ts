import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Rename "initial" and "invited" user state values to "pending"
 */
export class RenameInitialAndInvitedUserStateToPendingMigration1590750557000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE users SET state = 'pending' WHERE state = 'initial' OR state = 'invited';
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE users SET state = 'invited' WHERE state = 'pending';
    `);
  }
}
