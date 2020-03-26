import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Project migration
 */
export class ProjectMigration1564574530189 implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE projects (
        id varchar(64) PRIMARY KEY,
        title varchar(100) NOT NULL,
        description varchar(1024) NOT NULL,
        owner_id varchar(64) NOT NULL REFERENCES users(id),
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
      DROP TABLE projects;
    `);
  }
}
