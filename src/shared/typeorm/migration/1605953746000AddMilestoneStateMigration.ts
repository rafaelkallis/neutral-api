import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add milestone state.
 */
export class AddMilestoneStateMigration1605953746000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE milestones ADD COLUMN state varchar(255);
      UPDATE milestones SET state = 'cancelled';
      ALTER TABLE milestones ALTER COLUMN state SET not null;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE milestones DROP COLUMN state;
    `);
  }
}
