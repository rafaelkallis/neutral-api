import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add notifications table.
 */
export class AddNotificationsMigration1578833839000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE notifications (
        id varchar(64) PRIMARY KEY,
        owner_id varchar(64) NOT NULL REFERENCES users(id),
        type varchar(64) NOT NULL,
        is_read boolean NOT NULL,
        payload jsonb NOT NULL,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL
      );

      CREATE INDEX notifications_owner_id_index
        ON notifications (owner_id);
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX notifications_owner_id_index;
      
      DROP TABLE notifications;
    `);
  }
}
