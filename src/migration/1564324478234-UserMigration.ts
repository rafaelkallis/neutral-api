import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * User migration
 */
export class UserMigration1564324478234 implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id varchar(20) PRIMARY KEY,
        email varchar(100) UNIQUE NOT NULL,
        first_name varchar(100) NOT NULL,
        last_name varchar(100) NOT NULL,
        last_login_at bigint NOT NULL,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL
      );
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE users;
    `);
  }
}
